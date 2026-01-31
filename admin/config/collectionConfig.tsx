
import React from 'react';

export interface ColumnDefinition {
    id: string;
    label: string;
    accessor: string;
    width?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

export interface SchemaField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'json';
    required?: boolean;
    options?: { label: string; value: any }[]; // For select type
    defaultValue?: any;
    placeholder?: string;
}

export interface CollectionConfig {
    id: string;
    title: string;
    description: string;
    apiEndpoint: string;
    columns: ColumnDefinition[];
    icon: string;
    searchable: boolean;
    searchPlaceholder: string;
    mapData?: (data: any) => any[];
    category?: string;
    // CRUD capabilities
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
    // Form schema
    schema?: SchemaField[];
}

export const COLLECTIONS: Record<string, CollectionConfig> = {
    'circles': {
        id: 'circles',
        title: 'Circles',
        description: 'Manage family circles and groups',
        apiEndpoint: '/admin/families', // Use the correct endpoint for CRUD
        icon: 'circle',
        category: 'Social',
        searchable: true,
        searchPlaceholder: 'Search circles...',
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        schema: [
            { key: 'name', label: 'Circle Name', type: 'text', required: true, placeholder: 'e.g. Smith Family' },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Brief description of the circle' },
            { 
                key: 'type', 
                label: 'Type', 
                type: 'select', 
                required: true, 
                options: [
                    { label: 'Family Circle', value: 'Circle' },
                    { label: 'Friends Group', value: 'friends' },
                    { label: 'Sharehouse', value: 'sharehouse' }
                ],
                defaultValue: 'Circle'
            }
        ],
        columns: [
            { id: 'name', label: 'Name', accessor: 'name' },
            { id: 'type', label: 'Type', accessor: 'type' },
            { id: 'members', label: 'Members', accessor: 'member_count' },
            { 
                id: 'status', 
                label: 'Status', 
                accessor: 'is_active', // Mapped from backend logic often
                render: (val: boolean) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        val ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {val ? 'Active' : 'Inactive'}
                    </span>
                )
            },
            { 
                id: 'created_at', 
                label: 'Created At', 
                accessor: 'created_at',
                render: (val: string) => new Date(val).toLocaleDateString() 
            }
        ]
    },
    'circle-types': {
        id: 'circle-types',
        title: 'Circle Types',
        description: 'Manage types of circles (e.g. Family, Friends)',
        apiEndpoint: '/admin/circle-types',
        icon: 'collection',
        category: 'Settings',
        searchable: true,
        searchPlaceholder: 'Search types...',
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        schema: [
            { key: 'name', label: 'Type Name', type: 'text', required: true },
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
        ],
        columns: [
            { id: 'name', label: 'Name', accessor: 'name' },
            { id: 'code', label: 'Code', accessor: 'code' },
            { id: 'description', label: 'Description', accessor: 'description' },
            { 
                id: 'is_active', 
                label: 'Status', 
                accessor: 'is_active',
                render: (val: boolean) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {val ? 'Active' : 'Inactive'}
                    </span>
                )
            }
        ]
    },
    'social-posts': {
        id: 'social-posts',
        title: 'Social Posts',
        description: 'Manage user content and posts',
        apiEndpoint: '/admin/social-posts',
        icon: 'chat',
        category: 'Social',
        searchable: true,
        searchPlaceholder: 'Search posts...',
        canDelete: true, // Posts are usually user-generated, admin just deletes
        columns: [
            { id: 'content', label: 'Content', accessor: 'content', width: '40%' },
            { id: 'author', label: 'Author', accessor: 'author_name' },
            { id: 'likes', label: 'Likes', accessor: 'like_count' },
            { 
                id: 'created_at', 
                label: 'Posted At', 
                accessor: 'created_at',
                render: (val: string) => new Date(val).toLocaleString() 
            }
        ]
    },
    'users': {
        id: 'users',
        title: 'Users',
        description: 'Manage mobile application users',
        apiEndpoint: '/admin/users',
        icon: 'user',
        category: 'System',
        searchable: true,
        searchPlaceholder: 'Search users by name or email...',
        canUpdate: true, // Admin can update users
        canDelete: true,
        schema: [
            { key: 'firstName', label: 'First Name', type: 'text' },
            { key: 'lastName', label: 'Last Name', type: 'text' },
            { key: 'email', label: 'Email', type: 'text', required: true },
            { key: 'is_active', label: 'Active Status', type: 'boolean', defaultValue: true },
            { 
                key: 'status', 
                label: 'Status Label', 
                type: 'select', 
                options: [
                    { label: 'Active', value: 'active' }, 
                    { label: 'Suspended', value: 'suspended' },
                    { label: 'Inactive', value: 'inactive' }
                ] 
            },
            { key: 'metadata', label: 'Metadata (JSON)', type: 'json' }
        ],
        columns: [
            { 
                id: 'name', 
                label: 'Name', 
                accessor: 'first_name',
                render: (_val: string, item: any) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'
            },
            { id: 'email', label: 'Email', accessor: 'email' },
            { 
                id: 'role', 
                label: 'Role', 
                accessor: 'metadata.role', // Updated accessor based on observed data
                render: (val: string) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        val === 'admin' ? 'bg-red-100 text-red-800' : 
                        val === 'moderator' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {val || 'user'}
                    </span>
                )
            },
            { 
                id: 'status', 
                label: 'Status', 
                accessor: 'is_active', // Users logic uses boolean or mapped string
                render: (val: boolean | string) => {
                    const status = val === true ? 'active' : (val === false ? 'inactive' : val);
                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            status === 'active' ? 'bg-green-100 text-green-800' : 
                            status === 'suspended' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {status || 'active'}
                        </span>
                    )
                }
            },
            { 
                id: 'created_at', 
                label: 'Joined', 
                accessor: 'created_at',
                render: (val: string) => val ? new Date(val).toLocaleDateString() : 'Unknown'
            }
        ]
    }
};
