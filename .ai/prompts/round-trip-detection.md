# Round-Trip Requirement Detection

## Round-Trip Detection Prompt

Use this prompt to identify when round-trip testing requirements should be automatically included:

```
ROUND-TRIP REQUIREMENT DETECTION

Analyze the requirements document for parser/serializer references: "{requirements_text}"

SCAN FOR KEYWORDS:

**Parsing Keywords:**
- "parse", "parsing", "parser"
- "read", "load", "import"
- "decode", "decrypt", "decompress"
- "interpret", "process", "analyze"

**Serialization Keywords:**
- "serialize", "serialization", "deserialize"
- "write", "save", "export"
- "encode", "encrypt", "compress"
- "format", "generate", "produce"

**Data Format Keywords:**
- "JSON", "XML", "CSV", "YAML", "TOML"
- "HTML", "Markdown", "PDF"
- "binary", "text", "configuration"
- "protocol", "message", "packet"

**Transformation Keywords:**
- "convert", "transform", "translate"
- "map", "migrate", "adapt"
- "normalize", "validate", "sanitize"

DETECTION RESULTS:
- Parsing Detected: YES/NO
- Serialization Detected: YES/NO
- Data Formats Found: [list]
- Transformation Operations: [list]

IF ROUND-TRIP TESTING NEEDED:
Auto-generate this requirement:

### Requirement [N]: Data Integrity and Round-Trip Testing

**User Story:** As a developer, I want parsing and serialization operations to maintain data integrity, so that information is preserved accurately throughout all transformations.

#### Acceptance Criteria

1. WHEN [detected_format] data is parsed and then serialized, THE [System_Name] SHALL produce equivalent data structures
2. THE [Parser_Component] SHALL correctly handle all valid [format] inputs as defined by the [specification]
3. IF invalid [format] input is provided, THEN THE [Parser_Component] SHALL provide clear error messages indicating the specific validation failure
4. THE [Serializer_Component] SHALL generate [format] output that conforms to the target format specification
5. WHEN round-trip operations are performed on [data_type], THE System SHALL maintain complete data fidelity with no information loss

JUSTIFICATION: Round-trip testing is critical for [detected_operations] because [specific_risks].
```

## Detection Examples

### ✅ SHOULD Trigger Round-Trip Requirements

**Example 1: JSON API**
```
"WHEN a user submits form data, THE API SHALL parse the JSON request and validate all fields"
→ DETECTED: JSON parsing
→ AUTO-ADD: JSON round-trip testing requirement
```

**Example 2: Configuration Files**
```
"THE Configuration Manager SHALL load settings from YAML files at startup"
→ DETECTED: YAML parsing
→ AUTO-ADD: YAML round-trip testing requirement
```

**Example 3: Data Export**
```
"WHERE export functionality is enabled, THE Report Generator SHALL serialize data to CSV format"
→ DETECTED: CSV serialization
→ AUTO-ADD: CSV round-trip testing requirement
```

**Example 4: Protocol Handling**
```
"WHEN network messages arrive, THE Protocol Handler SHALL decode the binary protocol"
→ DETECTED: Binary protocol parsing
→ AUTO-ADD: Protocol round-trip testing requirement
```

### ❌ Should NOT Trigger Round-Trip Requirements

**Example 1: Simple Display**
```
"THE User Interface SHALL display user names in the header"
→ NO DETECTION: Simple display, no parsing/serialization
```

**Example 2: Database Operations**
```
"WHEN a user saves data, THE Database SHALL store the record"
→ NO DETECTION: Database storage, not format conversion
```

**Example 3: Network Communication**
```
"THE System SHALL send notifications via email"
→ NO DETECTION: Communication, not data transformation
```

## Auto-Generated Requirements by Format

### JSON Round-Trip Requirements
```
### Requirement [N]: JSON Data Integrity

**User Story:** As a developer, I want JSON parsing and serialization to maintain data integrity, so that API communication is reliable and accurate.

#### Acceptance Criteria

1. WHEN JSON data is parsed and then serialized, THE JSON Handler SHALL produce equivalent data structures
2. THE JSON Parser SHALL correctly handle all valid JSON inputs as defined by RFC 7159
3. IF invalid JSON input is provided, THEN THE JSON Parser SHALL provide clear error messages indicating the specific syntax error location
4. THE JSON Serializer SHALL generate JSON output that conforms to RFC 7159 specification
5. WHEN round-trip operations are performed on complex nested objects, THE System SHALL maintain complete data fidelity including data types and structure
```

### XML Round-Trip Requirements
```
### Requirement [N]: XML Data Integrity

**User Story:** As a developer, I want XML parsing and serialization to preserve document structure, so that data exchange with external systems is accurate.

#### Acceptance Criteria

1. WHEN XML documents are parsed and then serialized, THE XML Handler SHALL produce equivalent document structures
2. THE XML Parser SHALL correctly handle all well-formed XML inputs including namespaces and attributes
3. IF malformed XML input is provided, THEN THE XML Parser SHALL provide clear error messages with line and column numbers
4. THE XML Serializer SHALL generate valid XML output with proper escaping and namespace declarations
5. WHEN round-trip operations are performed on XML with CDATA sections and processing instructions, THE System SHALL preserve all content exactly
```

### Configuration File Round-Trip Requirements
```
### Requirement [N]: Configuration Data Integrity

**User Story:** As a system administrator, I want configuration file parsing to be reliable, so that system settings are applied correctly without data loss.

#### Acceptance Criteria

1. WHEN configuration files are loaded and saved, THE Configuration Manager SHALL preserve all settings and comments
2. THE Configuration Parser SHALL correctly handle all supported configuration formats and syntax variations
3. IF configuration syntax errors are found, THEN THE Configuration Parser SHALL provide clear error messages with file location details
4. THE Configuration Writer SHALL generate properly formatted configuration files that maintain readability
5. WHEN configuration round-trip operations are performed, THE System SHALL preserve all data types, comments, and formatting where possible
```

### Binary Protocol Round-Trip Requirements
```
### Requirement [N]: Protocol Data Integrity

**User Story:** As a developer, I want binary protocol handling to be accurate, so that network communication maintains data integrity.

#### Acceptance Criteria

1. WHEN binary protocol messages are decoded and re-encoded, THE Protocol Handler SHALL produce identical byte sequences
2. THE Protocol Decoder SHALL correctly handle all valid message formats as defined by the protocol specification
3. IF invalid protocol data is received, THEN THE Protocol Decoder SHALL provide clear error messages indicating the specific validation failure
4. THE Protocol Encoder SHALL generate binary output that conforms exactly to the protocol specification
5. WHEN round-trip operations are performed on complex protocol messages, THE System SHALL maintain bit-perfect accuracy for all fields
```

## Risk Assessment for Round-Trip Testing

### HIGH RISK (Always require round-trip testing)
- Financial data formats (precision critical)
- Security tokens and certificates
- Database migration scripts
- API request/response formats
- Configuration files affecting system behavior

### MEDIUM RISK (Usually require round-trip testing)
- User-generated content formats
- Report and export formats
- Inter-system communication protocols
- Backup and restore formats

### LOW RISK (Consider case-by-case)
- Display formatting only
- Temporary data transformations
- One-way data flows
- Simple text processing

## Implementation Notes

1. **Automatic Detection**: Run this detection on every requirements document
2. **User Confirmation**: Ask user before auto-adding round-trip requirements
3. **Customization**: Allow user to modify auto-generated requirements
4. **Integration**: Include round-trip requirements in testability analysis
5. **Traceability**: Link round-trip requirements to original parsing/serialization requirements