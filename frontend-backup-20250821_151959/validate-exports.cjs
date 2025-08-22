#!/usr/bin/env node
/**
 * Export Validation Script
 * Validates that all UI components have proper named exports
 * to prevent import/export mismatches
 */

const fs = require('fs');
const path = require('path');

const SHARED_UI_DIR = path.join(__dirname, 'src/shared/ui');
const INDEX_FILE = path.join(SHARED_UI_DIR, 'index.ts');

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateExports() {
  try {
    log('🔍 Validating UI component exports...', 'blue');
    
    // Read index.ts to find all exports
    const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
    const exportMatches = indexContent.match(/export\s*{\s*([^}]+)\s*}\s*from\s*['"](\.\/[^'"]+)['"]/g);
    
    if (!exportMatches) {
      log('❌ No exports found in index.ts', 'red');
      return;
    }

    let hasErrors = false;
    let checkedComponents = 0;

    for (const match of exportMatches) {
      const componentMatch = match.match(/export\s*{\s*([^}]+)\s*}\s*from\s*['"](\.\/[^'"]+)['"]/);
      if (!componentMatch) continue;

      const componentNames = componentMatch[1].split(',').map(name => name.trim());
      const filePath = componentMatch[2];
      const fullPath = path.join(SHARED_UI_DIR, filePath + '.tsx');

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        log(`❌ ${filePath}: File not found`, 'red');
        hasErrors = true;
        continue;
      }

      // Read component file
      const componentContent = fs.readFileSync(fullPath, 'utf8');
      
      for (const componentName of componentNames) {
        checkedComponents++;
        
        // Check for named export
        const namedExportRegex = new RegExp(`export\\s*{[^}]*\\b${componentName}\\b[^}]*}`, 'g');
        const hasNamedExport = namedExportRegex.test(componentContent);
        
        // Check for default export  
        const defaultExportRegex = new RegExp(`export\\s+default\\s+${componentName}`, 'g');
        const hasDefaultExport = defaultExportRegex.test(componentContent);
        
        if (hasNamedExport && hasDefaultExport) {
          log(`✅ ${componentName}: Both named and default exports found`, 'green');
        } else if (hasNamedExport) {
          log(`⚠️  ${componentName}: Only named export found`, 'yellow');
        } else if (hasDefaultExport) {
          log(`⚠️  ${componentName}: Only default export found (missing named export)`, 'yellow');
          log(`   💡 Fix: Add 'export { ${componentName} };' to ${filePath}.tsx`, 'blue');
        } else {
          log(`❌ ${componentName}: No exports found`, 'red');
          hasErrors = true;
        }
      }
    }

    log(`\n📊 Validation Summary:`, 'blue');
    log(`   Components checked: ${checkedComponents}`, 'blue');
    
    if (hasErrors) {
      log('❌ Validation failed with errors', 'red');
      process.exit(1);
    } else {
      log('🎉 Validation completed successfully!', 'green');
    }

  } catch (error) {
    log(`❌ Validation error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run validation
validateExports();