/**
 * Enhanced File Management Service
 * 
 * This service provides enhanced file management functionality using Prisma client
 * and proper model relationships for best practices implementation.
 */

import { prisma } from '../database';
import { File, FileFolder, FileTag, FileTagAssignment, FileShare, FileRecentAccess } from '@prisma/client';

export interface EnhancedFileItem extends File {
  tags: FileTag[];
  shares: FileShare[];
  recentAccess: FileRecentAccess[];
  uploaderName?: string;
}

export interface EnhancedFileFolder extends FileFolder {
  fileCount: number;
  totalSize: number;
  tags: FileTag[];
  shares: FileShare[];
}

export interface FileShareWithDetails extends FileShare {
  file: File;
  sharedByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FileTagWithUsage extends FileTag {
  fileCount: number;
  totalSize: number;
  usedBy: string[];
}

/**
 * Enhanced File Management Service with Best Practices
 */
export class EnhancedFileManagementService {
  
  /**
   * Get files with enhanced relationships
   */
  async getFilesEnhanced(
    userId: string,
    options: {
      status?: string;
      fileType?: string;
      folderId?: string;
      circleId?: string;
      tags?: string[];
      search?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ files: EnhancedFileItem[]; total: number }> {
    const whereClause: any = {
      userId: userId,
      status: options.status || 'active'
    };

    if (options.fileType) {
      whereClause.fileType = options.fileType;
    }

    if (options.folderId) {
      whereClause.folderId = options.folderId;
    }

    if (options.circleId) {
      whereClause.circleId = options.circleId;
    }

    if (options.search) {
      whereClause.OR = [
        { originalFilename: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: whereClause,
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          shares: {
            where: {
              isActive: true,
              OR: [
                { expiresAt: { gt: new Date() } },
                { expiresAt: null }
              ]
            },
            include: {
              sharedByUser: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          recentAccess: {
            where: { userId: userId },
            orderBy: { accessedAt: 'desc' },
            take: 5
          }
        },
        orderBy: [
          { [options.sortBy || 'createdAt']: options.sortOrder || 'desc' }
        ],
        take: options.limit || 50,
        skip: options.offset || 0
      }),
      prisma.file.count({ where: whereClause })
    ]);

    return {
      files: files.map(file => ({
        ...file,
        uploaderName: `${file.userId}` // Would need user join for real name
      })),
      total
    };
  }

  /**
   * Get file with full details
   */
  async getFileEnhanced(fileId: string): Promise<EnhancedFileItem | null> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        shares: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: { gt: new Date() } },
              { expiresAt: null }
            ]
          },
          include: {
            sharedByUser: {
              select: {
                id: true,
              firstName: true,
              lastName: true,
              email: true
              }
            }
          }
        },
        recentAccess: {
          where: { userId: fileId },
          orderBy: { accessedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!file) return null;

    return {
      ...file,
      uploaderName: `${file.userId}` // Would need user join for real name
    };
  }

  /**
   * Update file with enhanced field mapping
   */
  async updateFileEnhanced(fileId: string, data: Partial<File>, userId: string): Promise<File | null> {
    const file = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!file) return null;

    return await prisma.file.update({
      where: { id: fileId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Move files with enhanced error handling
   */
  async moveFilesEnhanced(fileIds: string[], targetFolderId: string | null, userId: string): Promise<number> {
    // Verify ownership of all files
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        userId: userId
      }
    });

    if (files.length !== fileIds.length) {
      throw new Error('Some files not found or access denied');
    }

    const result = await prisma.file.updateMany({
      where: {
        id: { in: fileIds }
      },
      data: {
        folderId: targetFolderId,
        updatedAt: new Date()
      }
    });

    return result.count;
  }

  /**
   * Copy file with enhanced metadata handling
   */
  async copyFileEnhanced(fileId: string, targetFolderId: string | null, userId: string): Promise<File | null> {
    const originalFile = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!originalFile) return null;

    // Create copy with enhanced metadata
    const copiedFile = await prisma.file.create({
      data: {
        originalFilename: `${originalFile.originalFilename} (copy)`,
        filename: `${originalFile.filename}_copy_${Date.now()}`,
        mimeType: originalFile.mimeType,
        fileSize: originalFile.fileSize,
        storagePath: originalFile.storagePath,
        url: originalFile.url,
        thumbnailUrl: originalFile.thumbnailUrl,
        folderId: targetFolderId,
        userId: userId,
        circleId: originalFile.circleId,
        description: originalFile.description ? `${originalFile.description} (copy)` : null,
        fileType: originalFile.fileType,
        metadata: {
          ...originalFile.metadata,
          copiedFrom: fileId,
          copiedAt: new Date().toISOString()
        }
      }
    });

    return copiedFile;
  }

  /**
   * Delete file with enhanced cleanup
   */
  async deleteFileEnhanced(fileId: string, userId: string): Promise<boolean> {
    // Soft delete first
    const softDeleted = await prisma.file.update({
      where: { id: fileId, userId: userId },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    });

    // Clean up related records
    await Promise.all([
      prisma.fileTagAssignment.deleteMany({
        where: { fileId: fileId }
      }),
      prisma.fileShare.updateMany({
        where: { fileId: fileId },
        data: { isActive: false }
      }),
      prisma.fileRecentAccess.deleteMany({
        where: { fileId: fileId }
      })
    ]);

    return true;
  }

  /**
   * Increment view count with enhanced tracking
   */
  async incrementViewCountEnhanced(fileId: string, userId: string): Promise<void> {
    await Promise.all([
      prisma.file.update({
        where: { id: fileId },
        data: {
          viewCount: { increment: 1 },
          lastAccessedAt: new Date()
        }
      }),
      prisma.fileRecentAccess.upsert({
        where: {
          fileId_userId: {
            fileId: fileId,
            userId: userId
          }
        },
        update: {
          accessedAt: new Date()
        },
        create: {
          fileId: fileId,
          userId: userId,
          accessType: 'view',
          accessedAt: new Date()
        }
      })
    ]);
  }

  /**
   * Increment download count with enhanced tracking
   */
  async incrementDownloadCountEnhanced(fileId: string, userId: string): Promise<void> {
    await Promise.all([
      prisma.file.update({
        where: { id: fileId },
        data: {
          downloadCount: { increment: 1 },
          lastAccessedAt: new Date()
        }
      }),
      prisma.fileRecentAccess.upsert({
        where: {
          fileId_userId: {
            fileId: fileId,
            userId: userId
          }
        },
        update: {
          accessedAt: new Date(),
          accessType: 'download'
        },
        create: {
          fileId: fileId,
          userId: userId,
          accessType: 'download',
          accessedAt: new Date()
        }
      })
    ]);
  }

  /**
   * Get folders with enhanced metadata
   */
  async getFoldersEnhanced(userId: string, parentId?: string): Promise<EnhancedFileFolder[]> {
    const whereClause: any = {
      userId: userId,
      parentId: parentId || null
    };

    const folders = await prisma.fileFolder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: true
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    return folders.map(folder => ({
      ...folder,
      fileCount: folder._count || 0,
      totalSize: 0, // Would need aggregation query
      tags: [],
      shares: []
    }));
  }

  /**
   * Create tag with enhanced validation
   */
  async createTagEnhanced(name: string, color: string, userId: string, circleId?: string): Promise<FileTag> {
    // Validate tag name uniqueness for user
    const existingTag = await prisma.fileTag.findFirst({
      where: {
        name: name,
        userId: userId,
        circleId: circleId || null
      }
    });

    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    return await prisma.fileTag.create({
      data: {
        name,
        color,
        userId,
        circleId
      }
    });
  }

  /**
   * Assign tag to file with enhanced validation
   */
  async assignTagEnhanced(fileId: string, tagId: string, userId: string): Promise<void> {
    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!file) {
      throw new Error('File not found or access denied');
    }

    // Verify tag ownership
    const tag = await prisma.fileTag.findUnique({
      where: { id: tagId }
    });

    if (!tag || (tag.userId !== userId && tag.circleId)) {
      throw new Error('Tag not found or access denied');
    }

    await prisma.fileTagAssignment.upsert({
      where: {
        fileId_tagId: {
          fileId: fileId,
          tagId: tagId
        }
      },
      update: {
        assignedBy: userId
      },
      create: {
        fileId: fileId,
        tagId: tagId,
        assignedBy: userId
      }
    });
  }

  /**
   * Remove tag from file with enhanced validation
   */
  async removeTagEnhanced(fileId: string, tagId: string, userId: string): Promise<void> {
    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!file) {
      throw new Error('File not found or access denied');
    }

    await prisma.fileTagAssignment.delete({
      where: {
        fileId: fileId,
        tagId: tagId
      }
    });
  }

  /**
   * Create file share with enhanced validation
   */
  async createFileShareEnhanced(
    fileId: string,
    sharedWithUserId?: string,
    sharedWithCircleId?: string,
    permission: 'view' | 'edit' | 'download' = 'view',
    expiresAt?: Date,
    downloadLimit?: number,
    userId: string
  ): Promise<FileShare> {
    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!file) {
      throw new Error('File not found or access denied');
    }

    return await prisma.fileShare.create({
      data: {
        fileId,
        sharedBy: userId,
        sharedWithUserId,
        sharedWithCircleId,
        permission,
        expiresAt,
        downloadLimit
      }
    });
  }

  /**
   * Create share link with enhanced security
   */
  async createShareLinkEnhanced(
    fileId: string,
    permission: 'view' | 'edit' | 'download' = 'view',
    expiresAt?: Date,
    downloadLimit?: number,
    password?: string,
    userId: string
  ): Promise<FileShare> {
    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId, userId: userId }
    });

    if (!file) {
      throw new Error('File not found or access denied');
    }

    const shareLink = `share_${fileId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await prisma.fileShare.create({
      data: {
        fileId,
        sharedBy: userId,
        shareLink,
        permission,
        expiresAt,
        downloadLimit,
        linkPasswordHash: password ? await this.hashPassword(password) : null
      }
    });
  }

  /**
   * Get file shares with enhanced filtering
   */
  async getFileSharesEnhanced(fileId: string): Promise<FileShareWithDetails[]> {
    return await prisma.fileShare.findMany({
      where: {
        fileId: fileId,
        isActive: true,
        OR: [
          { expiresAt: { gt: new Date() } },
          { expiresAt: null }
        ]
      },
      include: {
        file: true,
        sharedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get files shared with user with enhanced filtering
   */
  async getSharedWithMeEnhanced(userId: string): Promise<EnhancedFileItem[]> {
    const shares = await prisma.fileShare.findMany({
      where: {
        sharedWithUserId: userId,
        isActive: true,
        OR: [
          { expiresAt: { gt: new Date() } },
          { expiresAt: null }
        ]
      },
      include: {
        file: true
      }
    });

    return shares.map(share => ({
      ...share.file,
      uploaderName: `${share.file.userId}` // Would need user join for real name
    }));
  }

  /**
   * Get recent files with enhanced tracking
   */
  async getRecentFilesEnhanced(userId: string, limit: number = 20): Promise<EnhancedFileItem[]> {
    const recentAccess = await prisma.fileRecentAccess.findMany({
      where: {
        userId: userId
      },
      include: {
        file: {
          where: { status: 'active' }
        }
      },
      orderBy: { accessedAt: 'desc' },
      take: limit,
      distinct: ['fileId']
    });

    return recentAccess.map(access => ({
      ...access.file,
      uploaderName: `${access.file.userId}` // Would need user join for real name
    }));
  }

  /**
   * Get favorite files with enhanced filtering
   */
  async getFavoriteFilesEnhanced(userId: string): Promise<EnhancedFileItem[]> {
    const files = await prisma.file.findMany({
      where: {
        userId: userId,
        status: 'active',
        isFavorite: true
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return files.map(file => ({
      ...file,
      uploaderName: `${file.userId}` // Would need user join for real name
    }));
  }

  /**
   * Get favorite folders with enhanced filtering
   */
  async getFavoriteFoldersEnhanced(userId: string): Promise<EnhancedFileFolder[]> {
    const folders = await prisma.fileFolder.findMany({
      where: {
        userId: userId,
        isFavorite: true
      },
      include: {
        _count: {
          select: true
        }
      },
      orderBy: { name: 'asc' }
    });

    return folders.map(folder => ({
      ...folder,
      fileCount: folder._count || 0,
      totalSize: 0,
      tags: [],
      shares: []
    }));
  }

  /**
   * Get file statistics with enhanced calculations
   */
  async getFileStatistics(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    usedStorage: number;
    favoriteFiles: number;
    sharedFiles: number;
    recentFiles: number;
  }> {
    const [
      totalFiles,
      totalSize,
      favoriteFiles,
      sharedFiles,
      recentFiles
    ] = await Promise.all([
      prisma.file.count({
        where: { userId, status: 'active' }
      }),
      prisma.file.aggregate({
        where: { userId, status: 'active' },
        _sum: { fileSize: true }
      }),
      prisma.file.count({
        where: { userId, status: 'active', isFavorite: true }
      }),
      prisma.fileShare.count({
        where: {
          sharedWithUserId: userId,
          isActive: true,
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null }
          ]
        }
      }),
      prisma.fileRecentAccess.count({
        where: { userId },
        distinct: ['fileId']
      })
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.fileSize || 0,
      usedStorage: totalSize._sum.fileSize || 0,
      favoriteFiles,
      sharedFiles,
      recentFiles
    };
  }

  /**
   * Hash password for share links
   */
  private async hashPassword(password: string): Promise<string> {
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(password, salt, 100000, 512, 'sha512').toString('hex');
  }

  /**
   * Get tag usage statistics
   */
  async getTagStatistics(userId: string): Promise<FileTagWithUsage[]> {
    const tags = await prisma.fileTag.findMany({
      where: {
        userId: userId
      },
      include: {
        _count: {
          select: true
        },
        fileTagAssignments: {
          include: {
            file: {
              select: {
                fileSize: true
              }
            }
          }
        }
      }
    });

    return tags.map(tag => ({
      ...tag,
      fileCount: tag._count || 0,
      totalSize: tag.fileTagAssignments.reduce((sum, assignment) => sum + (assignment.file.fileSize || 0), 0),
      usedBy: tag.fileTagAssignments.map(assignment => assignment.file.userId)
    }));
  }
}

export default new EnhancedFileManagementService();
