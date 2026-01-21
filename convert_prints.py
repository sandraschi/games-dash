import re

# Read the test runner file
with open('tests/test_runner.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all print( with logger.info(
# But be careful not to replace print statements inside strings or other contexts
# Use regex to find print statements that are at the start of a line (with indentation)
content = re.sub(r'^(\s*)print\(', r'\1logger.info(', content, flags=re.MULTILINE)

# Write back the file
with open('tests/test_runner.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Converted print statements to logger calls")