# Project Management Workflow Template

## Overview
This template defines the project management workflow for **{{PROJECT_NAME}}** using **{{METHODOLOGY}}** methodology.

*Auto-detected: {{PROJECT_TYPE}} | Team: {{TEAM_SIZE}} members | Complexity: {{PROJECT_COMPLEXITY}}*

## Project Information
- **Project Manager**: {{PM_NAME}}
- **Team Size**: {{TEAM_SIZE}} ({{DEVELOPER_COUNT}} developers, {{DESIGNER_COUNT}} designers, {{QA_COUNT}} QA)
- **Duration**: {{START_DATE}} to {{END_DATE}} ({{DURATION_WEEKS}} weeks)
- **Budget**: {{BUDGET}} 
- **Stakeholders**: {{STAKEHOLDER_LIST}}
- **Primary Tool**: {{PROJECT_TOOL}}
- **Communication**: {{COMMUNICATION_CHANNELS}}

{{#if (eq METHODOLOGY "Scrum")}}
## Sprint Planning (Scrum)

### Sprint Configuration
- **Duration**: {{SPRINT_DURATION}} ({{SPRINT_WEEKS}} weeks)
- **Capacity**: {{TEAM_VELOCITY}} story points/sprint
- **Sprint Goal**: {{CURRENT_SPRINT_GOAL}}

### Sprint Planning Meeting
- **When**: {{PLANNING_SCHEDULE}}
- **Duration**: {{PLANNING_DURATION}} ({{PLANNING_HOURS}} hours for {{SPRINT_WEEKS}}-week sprint)
- **Attendees**: {{SCRUM_TEAM}} + {{PRODUCT_OWNER}}

### Planning Process
1. **Sprint Goal & Roadmap Review** ({{GOAL_REVIEW_TIME}})
   - Product Owner presents sprint goal
   - Review product roadmap alignment
   - Discuss sprint success criteria

2. **Backlog Refinement** ({{BACKLOG_REVIEW_TIME}})
   - Review top {{BACKLOG_ITEMS_COUNT}} priority items
   - Clarify acceptance criteria
   - Update effort estimates

3. **Capacity Planning** ({{CAPACITY_PLANNING_TIME}})
   - Team availability: {{AVAILABLE_HOURS}} hours
   - Velocity trend: {{VELOCITY_TREND}}
   - Risk factors: {{RISK_FACTORS}}

4. **Sprint Backlog Creation** ({{COMMITMENT_TIME}})
   - Select items totaling {{TARGET_POINTS}} story points
   - Break down large items if needed
   - Confirm sprint goal achievability
{{/if}}

{{#if (eq METHODOLOGY "Kanban")}}
## Kanban Flow Management

### Work In Progress Limits
- **To Do**: No limit (prioritized backlog)
- **In Progress**: {{WIP_IN_PROGRESS}} items
- **In Review**: {{WIP_REVIEW}} items  
- **Done**: No limit

### Flow Metrics
- **Lead Time**: {{AVERAGE_LEAD_TIME}} days
- **Cycle Time**: {{AVERAGE_CYCLE_TIME}} days
- **Throughput**: {{WEEKLY_THROUGHPUT}} items/week

### Daily Flow Review
- **When**: {{DAILY_STANDUP_TIME}}
- **Focus**: Blocked items, bottlenecks, flow optimization
- **Duration**: 15 minutes maximum
{{/if}}

{{#if (eq METHODOLOGY "SAFe")}}
## Program Increment (PI) Planning

### PI Details
- **Duration**: {{PI_DURATION}} ({{PI_SPRINTS}} sprints)
- **PI Objectives**: {{PI_OBJECTIVES}}
- **Program Increment**: {{CURRENT_PI}}

### Team Planning
- **Capacity**: {{PI_CAPACITY}} story points
- **Committed**: {{PI_COMMITTED}} story points
- **Stretch**: {{PI_STRETCH}} story points

### Dependencies & Risks
- **Cross-team dependencies**: {{DEPENDENCIES_COUNT}}
- **Program risks**: {{PROGRAM_RISKS}}
- **Mitigation plans**: {{MITIGATION_PLANS}}
{{/if}}

### Sprint Planning Checklist
- [ ] Product backlog is prioritized and groomed
- [ ] User stories have clear acceptance criteria
- [ ] Effort estimates are complete and agreed upon
- [ ] Team capacity is confirmed
- [ ] Sprint goal is defined and understood
- [ ] Sprint backlog is finalized

## Daily Standup

### Format
- **Time**: **[STANDUP_TIME]**
- **Duration**: 15 minutes maximum
- **Location**: **[STANDUP_LOCATION]**

### Structure
Each team member answers:
1. What did I complete yesterday?
2. What will I work on today?
3. Are there any impediments blocking me?

### Guidelines
- [ ] Keep updates brief and relevant
- [ ] Focus on progress toward sprint goal
- [ ] Raise blockers immediately
- [ ] Schedule detailed discussions offline
- [ ] Update task status in **[PROJECT_TOOL]**

## Task Management

### Task States
1. **[BACKLOG_STATE]** - Not yet started
2. **[IN_PROGRESS_STATE]** - Actively being worked on
3. **[IN_REVIEW_STATE]** - Under review/testing
4. **[BLOCKED_STATE]** - Cannot proceed due to dependency
5. **[DONE_STATE]** - Completed and accepted

### Task Assignment
- [ ] Assign tasks during sprint planning
- [ ] Self-assignment encouraged for daily work
- [ ] Update assignee when picking up tasks
- [ ] Notify team of task handoffs

### Definition of Ready (DoR)
Before a task can be started:
- [ ] Acceptance criteria are clear and testable
- [ ] Dependencies are identified and resolved
- [ ] Effort estimate is provided
- [ ] Priority is assigned
- [ ] Assigned to team member

### Definition of Done (DoD)
Before a task can be marked complete:
- [ ] **[DOD_CRITERIA_1]**
- [ ] **[DOD_CRITERIA_2]**
- [ ] **[DOD_CRITERIA_3]**
- [ ] **[DOD_CRITERIA_4]**
- [ ] **[DOD_CRITERIA_5]**

## Sprint Review

### Meeting Details
- **When**: End of each sprint
- **Duration**: **[REVIEW_DURATION]**
- **Attendees**: Team + Stakeholders

### Agenda
1. **Demo Completed Work** (40 min)
   - Show working software/deliverables
   - Get stakeholder feedback
   - Discuss any changes to requirements

2. **Metrics Review** (15 min)
   - Sprint velocity
   - Burn-down chart analysis
   - Quality metrics

3. **Stakeholder Feedback** (15 min)
   - Collect input on delivered features
   - Discuss upcoming priorities
   - Address concerns or questions

### Review Checklist
- [ ] All completed items are demonstrated
- [ ] Stakeholder feedback is documented
- [ ] Metrics are reviewed and discussed
- [ ] Next sprint priorities are confirmed
- [ ] Action items are captured

## Sprint Retrospective

### Meeting Details
- **When**: After sprint review
- **Duration**: **[RETRO_DURATION]**
- **Attendees**: Development team only

### Format Options
1. **Start/Stop/Continue**
2. **Mad/Sad/Glad**
3. **What went well/What could be improved/Action items**
4. **[CUSTOM_RETRO_FORMAT]**

### Retrospective Process
1. **Set the Stage** (5 min)
   - Review previous action items
   - Set expectations for the meeting

2. **Gather Data** (15 min)
   - Collect team input on sprint events
   - Use chosen retrospective format

3. **Generate Insights** (15 min)
   - Identify patterns and root causes
   - Prioritize improvement areas

4. **Decide What to Do** (10 min)
   - Create specific action items
   - Assign owners and deadlines

5. **Close the Retrospective** (5 min)
   - Summarize key takeaways
   - Confirm action items

### Action Item Tracking
- [ ] Document action items with owners
- [ ] Set specific deadlines
- [ ] Track progress during subsequent sprints
- [ ] Review completion in next retrospective

## Backlog Management

### Backlog Grooming
- **Frequency**: **[GROOMING_FREQUENCY]**
- **Duration**: **[GROOMING_DURATION]**
- **Attendees**: **[GROOMING_ATTENDEES]**

### Grooming Activities
- [ ] Add new user stories
- [ ] Break down large epics
- [ ] Estimate story points/effort
- [ ] Clarify acceptance criteria
- [ ] Update priorities based on feedback
- [ ] Remove obsolete items

### User Story Format
```
As a [user type],
I want [functionality]
So that [business value].

Acceptance Criteria:
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]
```

### Story Estimation
- **Method**: **[ESTIMATION_METHOD]** (Story Points, T-shirt sizes, Hours)
- **Reference Stories**: **[REFERENCE_STORIES]**
- **Team Velocity**: **[TEAM_VELOCITY]** per sprint

## Risk Management

### Risk Assessment
| Risk | Impact | Probability | Mitigation |
|------|---------|-------------|------------|
| **[RISK_1]** | **[IMPACT_1]** | **[PROB_1]** | **[MITIGATION_1]** |
| **[RISK_2]** | **[IMPACT_2]** | **[PROB_2]** | **[MITIGATION_2]** |
| **[RISK_3]** | **[IMPACT_3]** | **[PROB_3]** | **[MITIGATION_3]** |

### Risk Review Schedule
- **Frequency**: **[RISK_REVIEW_FREQUENCY]**
- **Owner**: **[RISK_OWNER]**
- **Process**: **[RISK_PROCESS]**

## Communication Plan

### Regular Meetings
- **Sprint Planning**: **[PLANNING_SCHEDULE]**
- **Daily Standups**: **[STANDUP_SCHEDULE]**
- **Sprint Review**: **[REVIEW_SCHEDULE]**
- **Sprint Retrospective**: **[RETRO_SCHEDULE]**
- **Backlog Grooming**: **[GROOMING_SCHEDULE]**

### Communication Channels
- **[CHANNEL_1]**: **[USAGE_1]**
- **[CHANNEL_2]**: **[USAGE_2]**
- **[CHANNEL_3]**: **[USAGE_3]**

### Status Reporting
- **Frequency**: **[STATUS_FREQUENCY]**
- **Format**: **[STATUS_FORMAT]**
- **Recipients**: **[STATUS_RECIPIENTS]**

## Tools and Templates

### Project Management Tools
- **Primary Tool**: **[PRIMARY_TOOL]**
- **Backup Tool**: **[BACKUP_TOOL]**
- **Integration Tools**: **[INTEGRATION_TOOLS]**

### Document Templates
- [ ] User story template
- [ ] Sprint planning template
- [ ] Retrospective template
- [ ] Status report template
- [ ] Risk register template

## Template Configuration

*This template adapts to your methodology and team size. Customize via `.workflow-config.json`*

### Auto-Detected Configuration
- `{{PROJECT_NAME}}` - From folder name, git repo, or package.json
- `{{PROJECT_TYPE}}` - Web App, API, Mobile, Desktop, or Library
- `{{TEAM_SIZE}}` - Estimated from git contributors or specified
- `{{PROJECT_COMPLEXITY}}` - Simple, Medium, or Complex
- `{{METHODOLOGY}}` - Recommended based on team size and project type

### Methodology-Specific Defaults

**Scrum (Teams 3-9 people)**
```json
{
  "projectManagement": {
    "METHODOLOGY": "Scrum",
    "SPRINT_DURATION": "2 weeks",
    "TEAM_VELOCITY": "auto-calculated",
    "PLANNING_DURATION": "2 hours",
    "DAILY_STANDUP_TIME": "9:00 AM",
    "REVIEW_DURATION": "1 hour",
    "RETRO_DURATION": "45 minutes"
  }
}
```

**Kanban (Any team size)**
```json
{
  "projectManagement": {
    "METHODOLOGY": "Kanban",
    "WIP_LIMITS": {
      "IN_PROGRESS": 3,
      "REVIEW": 2
    },
    "FLOW_METRICS": true,
    "DAILY_STANDUP_TIME": "9:00 AM"
  }
}
```

**SAFe (Large organizations)**
```json
{
  "projectManagement": {
    "METHODOLOGY": "SAFe",
    "PI_DURATION": "10 weeks",
    "PI_SPRINTS": 5,
    "PROGRAM_LEVEL": true
  }
}
```

### Customization Options
Full configuration example:
```json
{
  "projectManagement": {
    "PM_NAME": "Your Name",
    "STAKEHOLDER_LIST": ["Product Owner", "Tech Lead", "Business Analyst"],
    "PROJECT_TOOL": "Jira",
    "COMMUNICATION_CHANNELS": ["Slack #team", "Teams", "Email"],
    "DEFINITION_OF_DONE": [
      "Code reviewed and approved",
      "Tests written and passing", 
      "Documentation updated",
      "Deployed to staging",
      "Acceptance criteria met"
    ],
    "RISK_MANAGEMENT": {
      "REVIEW_FREQUENCY": "Weekly",
      "RISK_OWNER": "Project Manager",
      "ESCALATION_THRESHOLD": "High Impact + High Probability"
    }
  }
}
```

### Meeting Templates
*Auto-generated based on methodology and team size*
- Sprint Planning: {{PLANNING_TEMPLATE}}
- Daily Standups: {{STANDUP_TEMPLATE}}
- Sprint Review: {{REVIEW_TEMPLATE}}
- Retrospectives: {{RETRO_TEMPLATE}}

## Quick Setup
```powershell
# Generate project management workflow
./setup-workflow.ps1 -Template pm -ProjectPath . -Interactive

# Create meeting calendar invites
./setup-workflow.ps1 -CreateMeetings -Methodology {{METHODOLOGY}}

# Setup project tool integration
./setup-workflow.ps1 -ConnectTool {{PROJECT_TOOL}} -ProjectPath .
```
