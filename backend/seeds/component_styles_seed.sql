-- Seed file for component_styles
-- Run this after initial DB setup to populate default appearance settings

-- Insert default component styles matching current mobile app theme
INSERT INTO app_settings (key, value)
VALUES (
  'component_styles',
  '{
    "branding": {
      "appName": "Bondarys",
      "logoUrl": "/assets/logo.png",
      "primaryFont": "IBM Plex Sans Thai",
      "secondaryFont": "IBM Plex Sans Thai"
    },
    "categories": [
      {
        "id": "buttons",
        "name": "Buttons",
        "icon": "buttons",
        "components": [
          {
            "id": "primary",
            "name": "Primary Button",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#FFB6C1"},
              "textColor": {"mode": "solid", "solid": "#FFFFFF"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "secondary",
            "name": "Secondary Button",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.1)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "outline",
            "name": "Outline Button",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#FFB6C1"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "#FFB6C1"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "ghost",
            "name": "Ghost Button",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#6B7280"},
              "borderRadius": 8,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          }
        ]
      },
      {
        "id": "cards",
        "name": "Cards",
        "icon": "cards",
        "components": [
          {
            "id": "default",
            "name": "Default Card",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.8)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 16,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "md"
            }
          },
          {
            "id": "glass",
            "name": "Glass Card",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.1)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 16,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "lg"
            }
          },
          {
            "id": "modal",
            "name": "Modal Card",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.8)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 20,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "lg"
            }
          }
        ]
      },
      {
        "id": "typography",
        "name": "Typography",
        "icon": "typography",
        "components": [
          {
            "id": "heading",
            "name": "Headings",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "body",
            "name": "Body Text",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#6B7280"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "caption",
            "name": "Caption",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#9CA3AF"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "link",
            "name": "Links",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "transparent"},
              "textColor": {"mode": "solid", "solid": "#FF69B4"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          }
        ]
      },
      {
        "id": "inputs",
        "name": "Form Inputs",
        "icon": "inputs",
        "components": [
          {
            "id": "textInput",
            "name": "Text Input",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.8)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "select",
            "name": "Select/Dropdown",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.8)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "toggle",
            "name": "Toggle Switch",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#FFB6C1"},
              "textColor": {"mode": "solid", "solid": "#FFFFFF"},
              "borderRadius": 999,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "sm"
            }
          }
        ]
      },
      {
        "id": "navigation",
        "name": "Navigation",
        "icon": "navigation",
        "components": [
          {
            "id": "tabBar",
            "name": "Tab Bar",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.1)"},
              "textColor": {"mode": "solid", "solid": "#6B7280"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "tabActive",
            "name": "Active Tab",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#1F2937"},
              "textColor": {"mode": "solid", "solid": "#FFFFFF"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "#374151"},
              "shadowLevel": "md"
            }
          },
          {
            "id": "header",
            "name": "Header",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#FFB6C1"},
              "textColor": {"mode": "solid", "solid": "#FFFFFF"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "sm"
            }
          }
        ]
      },
      {
        "id": "layout",
        "name": "Layout",
        "icon": "layout",
        "components": [
          {
            "id": "container",
            "name": "Container",
            "styles": {
              "backgroundColor": {"mode": "gradient", "gradient": {"type": "linear", "angle": 180, "stops": [{"id": "1", "color": "#FFB6C1", "position": 0}, {"id": "2", "color": "#FFC0CB", "position": 100}]}},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "divider",
            "name": "Divider",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.3)"},
              "textColor": {"mode": "solid", "solid": "transparent"},
              "borderRadius": 0,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "none"
            }
          },
          {
            "id": "section",
            "name": "Section",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.8)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 16,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "sm"
            }
          }
        ]
      },
      {
        "id": "feedback",
        "name": "Feedback",
        "icon": "feedback",
        "components": [
          {
            "id": "toast",
            "name": "Toast",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#374151"},
              "textColor": {"mode": "solid", "solid": "#FFFFFF"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "transparent"},
              "shadowLevel": "lg"
            }
          },
          {
            "id": "modal",
            "name": "Modal",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "rgba(255, 255, 255, 0.95)"},
              "textColor": {"mode": "solid", "solid": "#374151"},
              "borderRadius": 20,
              "borderColor": {"mode": "solid", "solid": "rgba(255, 182, 193, 0.2)"},
              "shadowLevel": "lg"
            }
          },
          {
            "id": "success",
            "name": "Success Alert",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#D1FAE5"},
              "textColor": {"mode": "solid", "solid": "#065F46"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "#10B981"},
              "shadowLevel": "sm"
            }
          },
          {
            "id": "error",
            "name": "Error Alert",
            "styles": {
              "backgroundColor": {"mode": "solid", "solid": "#FEE2E2"},
              "textColor": {"mode": "solid", "solid": "#991B1B"},
              "borderRadius": 12,
              "borderColor": {"mode": "solid", "solid": "#EF4444"},
              "shadowLevel": "sm"
            }
          }
        ]
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": "system"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
