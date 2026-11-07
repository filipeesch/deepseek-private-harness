# workspace-visibility Specification

## Purpose

Lets a Workspace stay registered and usable while being omitted from the browsing surfaces, so plugins and users can manage Workspaces without imposing every one of them on the sidebar.

## Requirements

### Requirement: A Workspace is visible unless it is marked hidden

Every Workspace SHALL carry a durable hidden flag that defaults to visible. Creating a Workspace without naming the flag, and reading any record written before the flag existed, SHALL both report a visible Workspace. Changing the flag SHALL be durable across a Host restart.

#### Scenario: Creating without the flag yields a visible Workspace

- **WHEN** a Workspace is created without naming the hidden flag
- **THEN** the Workspace reports itself as visible

#### Scenario: A record written before the flag existed reads as visible

- **WHEN** the Host starts against durable state whose Workspace records predate the flag
- **THEN** every such Workspace reports itself as visible and the Host starts without a migration error

#### Scenario: A changed flag survives a restart

- **WHEN** a Workspace is marked hidden and the Host restarts
- **THEN** that Workspace still reports itself as hidden

#### Scenario: Setting the flag it already has changes nothing observable

- **WHEN** a visible Workspace is set to visible, or a hidden Workspace is set to hidden
- **THEN** the call resolves successfully and the Workspace's visibility is unchanged

### Requirement: A Workspace can be created already hidden

Creating a Workspace SHALL accept the hidden flag, so a caller can register a Workspace that is never visible in a browsing surface. Because creation is idempotent per canonical directory, a call that resolves an already-registered Workspace SHALL leave that Workspace's flag untouched.

#### Scenario: Creation stores the requested flag

- **WHEN** a Workspace is created with the hidden flag set
- **THEN** the new Workspace reports itself as hidden

#### Scenario: Recreating an existing Workspace keeps its current flag

- **WHEN** a hidden Workspace's directory is requested for creation without the flag
- **THEN** the call resolves the existing hidden Workspace and it stays hidden

### Requirement: The hidden flag is mutable through the Host API

A caller SHALL be able to mark a Workspace hidden or visible after creation, by Workspace identity. A request naming an unknown Workspace SHALL fail as not found without changing any Workspace.

#### Scenario: Hiding and revealing a known Workspace

- **WHEN** a caller marks a visible Workspace hidden and later marks it visible again
- **THEN** each call resolves after the change is durable and the Workspace reports the new value

#### Scenario: Unknown identity is refused

- **WHEN** a caller marks an unknown Workspace identity hidden
- **THEN** the call fails as not found and no Workspace changes

### Requirement: Every Workspace projection carries the hidden flag

Each Workspace row delivered to a Client SHALL carry the hidden flag, on the opening projection of a connection and on every later row change. A change to the flag SHALL reach Clients as an updated row, not as a removal followed by an addition, and a reconnecting Client SHALL receive the current value.

#### Scenario: The opening projection carries the flag

- **WHEN** a Client opens the Workspace projection
- **THEN** every delivered row states whether that Workspace is hidden

#### Scenario: A flag change arrives as an updated row

- **WHEN** a Workspace's hidden flag changes while a Client is following the projection
- **THEN** the Client receives that Workspace row again with the new value and receives no removal

#### Scenario: A reconnect reports the current value

- **WHEN** a Client reconnects after the flag changed while it was disconnected
- **THEN** its new opening projection states the current value for every Workspace

### Requirement: The sidebar omits hidden Workspaces and their Sessions

While hidden Workspaces are not revealed, the grouped sidebar SHALL render no section for a hidden Workspace and SHALL render none of that Workspace's Sessions. Those Sessions stay accounted to the Workspace: they MUST NOT appear under the ungrouped bucket, MUST NOT change the Workspace's saved Session order, and SHALL return to their saved positions when the Workspace is revealed.

#### Scenario: A hidden Workspace contributes no section

- **WHEN** the grouped sidebar renders while a Workspace is hidden and not revealed
- **THEN** no section exists for that Workspace

#### Scenario: Its Sessions do not become ungrouped

- **WHEN** a hidden Workspace accounts for Sessions
- **THEN** none of those Sessions appears under the ungrouped bucket or in the flat list

#### Scenario: Revealing restores the saved order

- **WHEN** a hidden Workspace with accounted Sessions is revealed
- **THEN** its section returns with the Sessions in the order saved before it was hidden

### Requirement: The open Session stays visible even when its Workspace is hidden

The browsing surface SHALL keep rendering the group holding the Session open in the main view while that Session is selected, even when its Workspace is hidden and hidden Workspaces are not revealed. The same exception SHALL keep that Session's row in the flat list. When the selection moves elsewhere, the exception SHALL end.

#### Scenario: The selected Session's group is rendered

- **WHEN** the Session open in the main view belongs to a hidden Workspace that is not revealed
- **THEN** the grouped sidebar renders that Workspace's section with the selected Session

#### Scenario: The exception ends with the selection

- **WHEN** the open Session changes to one outside that hidden Workspace
- **THEN** the hidden Workspace's section is no longer rendered

#### Scenario: The flat list keeps only that row

- **WHEN** the flat list renders while the open Session belongs to a hidden Workspace that is not revealed
- **THEN** that Session's row is listed and the hidden Workspace's other Sessions are not

### Requirement: Search follows the reveal choice without exception

Session search over titles, Workspace labels, Session identities, and recorded content SHALL include Sessions of hidden Workspaces only while hidden Workspaces are revealed. The open-Session exception of the sidebar SHALL NOT apply to search results.

#### Scenario: Hidden Sessions are excluded

- **WHEN** a query matches a Session of a hidden Workspace while hidden Workspaces are not revealed
- **THEN** the results omit that Session even when it is the open Session

#### Scenario: Revealed hidden Sessions match

- **WHEN** a query matches a Session of a hidden Workspace while hidden Workspaces are revealed
- **THEN** the results include that Session and label it with its Workspace

### Requirement: Workspace choosing follows the reveal choice

The Workspace chooser and the fallback that picks a Workspace for a new Session SHALL offer and select hidden Workspaces only while hidden Workspaces are revealed. An explicit request naming a hidden Workspace SHALL still be honored.

#### Scenario: The chooser omits hidden Workspaces

- **WHEN** the chooser opens while hidden Workspaces are not revealed
- **THEN** it lists no hidden Workspace

#### Scenario: The fallback skips hidden Workspaces

- **WHEN** a new Session requests no Workspace and hidden Workspaces are not revealed
- **THEN** the selected Workspace is not hidden, even when a hidden Workspace is the most recently active one

#### Scenario: An explicit request is honored

- **WHEN** a new Session explicitly names a hidden Workspace
- **THEN** the Session is created in that Workspace regardless of the reveal choice

### Requirement: The sidebar offers a persistent reveal choice

The sidebar header SHALL offer a control that alternates between omitting and revealing hidden Workspaces, stating which of the two the reader is seeing. The choice SHALL default to omitting, SHALL persist per browser so a reload keeps it, and SHALL govern every surface listed above. The control SHALL appear only while at least one Workspace is hidden or hidden Workspaces are currently revealed.

#### Scenario: Hidden Workspaces are omitted by default

- **WHEN** a reader who never used the control opens the sidebar
- **THEN** hidden Workspaces are omitted and the control states that they are omitted

#### Scenario: Revealing shows them everywhere

- **WHEN** the reader reveals hidden Workspaces
- **THEN** the sidebar, search, and the chooser operate on hidden Workspaces as on visible ones

#### Scenario: The choice survives a reload

- **WHEN** the reader reveals hidden Workspaces and reloads the browser
- **THEN** hidden Workspaces are still revealed

#### Scenario: The control is absent while nothing is hidden

- **WHEN** no Workspace is hidden and hidden Workspaces are omitted
- **THEN** the sidebar renders no reveal control

#### Scenario: The control appears once it has something to do

- **WHEN** at least one Workspace is hidden, or hidden Workspaces are already revealed
- **THEN** the sidebar renders the reveal control

### Requirement: Hiding never restricts access to a Workspace or its Sessions

The hidden flag SHALL NOT gate any operation. Opening an existing Session of a hidden Workspace, creating a Session in it, reordering its Sessions, renaming it, and following its rows SHALL behave exactly as for a visible Workspace. Hiding SHALL also leave the Workspace's Sessions, files, and directory untouched.

#### Scenario: A hidden Workspace's Session opens

- **WHEN** a reader opens a known Session of a hidden Workspace
- **THEN** the conversation opens and the sidebar shows it through the open-Session exception

#### Scenario: A hidden Workspace still mutates

- **WHEN** a caller renames a hidden Workspace or creates a Session inside it
- **THEN** the operation succeeds as it would for a visible Workspace

#### Scenario: Hiding touches nothing on disk or in a Session log

- **WHEN** a Workspace is marked hidden
- **THEN** its directory and its Sessions' stored logs are unchanged
