/**
 * Final Package Validation Test
 * 
 * **Feature: ears-workflow-skill-refactor, Property 10: Package portability**
 * **Validates: Requirements 6.1, 6.2**
 * 
 * This is the comprehensive final validation that ensures the EARS-workflow 
 * skill package is complete, portable, and ready for distribution.
 */

const { testPackageCompleteness } = require('./package-completeness-validation.test.js');
const { testMultiEnvironmentValidation } = require('./multi-environment-validation.test.js');
const { validateCrossReferences } = require('../scripts/validate-cross-references.js');

class FinalPackageValidator {
    constructor() {
        this.validationResults = [];
    }

    /**
     * Run package completeness validation
     */
    async runCompletenessValidation() {
        console.log('🔍 Running package completeness validation...\n');
        
        try {
            const result = testPackageCompleteness();
            this.validationResults.push({
                test: 'Package Completeness',
                passed: result.isValid,
                errors: result.errors,
                warnings: result.warnings,
                details: result.summary
            });
            return result.isValid;
        } catch (error) {
            this.validationResults.push({
                test: 'Package Completeness',
                passed: false,
                errors: [error.message],
                warnings: [],
                details: null
            });
            return false;
        }
    }

    /**
     * Run cross-reference validation
     */
    async runCrossReferenceValidation() {
        console.log('\n🔗 Running cross-reference validation...\n');
        
        try {
            const result = await validateCrossReferences();
            this.validationResults.push({
                test: 'Cross-Reference Integrity',
                passed: result.isValid,
                errors: result.errors,
                warnings: result.warnings,
                details: result.summary
            });
            return result.isValid;
        } catch (error) {
            this.validationResults.push({
                test: 'Cross-Reference Integrity',
                passed: false,
                errors: [error.message],
                warnings: [],
                details: null
            });
            return false;
        }
    }
    async runMultiEnvironmentValidation() {
        console.log('\n🌍 Running multi-environment validation...\n');
        
        try {
            const result = testMultiEnvironmentValidation();
            this.validationResults.push({
                test: 'Multi-Environment Portability',
                passed: result.allPassed,
                errors: result.results.filter(r => !r.success).map(r => `${r.environment}: ${r.errors.join(', ')}`),
                warnings: result.results.flatMap(r => r.warnings),
                details: result.summary
            });
            return result.allPassed;
        } catch (error) {
            this.validationResults.push({
                test: 'Multi-Environment Portability',
                passed: false,
                errors: [error.message],
                warnings: [],
                details: null
            });
            return false;
        }
    }

    /**
     * Validate package metadata and version information
     */
    validatePackageMetadata() {
        console.log('\n📋 Validating package metadata...\n');
        
        const fs = require('fs');
        const path = require('path');
        
        try {
            // Check main SKILL.md metadata
            const skillPath = path.join('.ai', 'SKILL.md');
            const skillContent = fs.readFileSync(skillPath, 'utf8');
            
            // Extract version from YAML frontmatter
            const versionMatch = skillContent.match(/version:\s*([^\r\n]+)/);
            const nameMatch = skillContent.match(/name:\s*([^\r\n]+)/);
            const descriptionMatch = skillContent.match(/description:\s*([^\r\n]+)/);
            
            const errors = [];
            const warnings = [];
            
            if (!versionMatch) {
                errors.push('Main SKILL.md missing version information');
            } else {
                const version = versionMatch[1].trim();
                if (!/^\d+\.\d+\.\d+$/.test(version)) {
                    errors.push(`Invalid version format: ${version}`);
                }
            }
            
            if (!nameMatch) {
                errors.push('Main SKILL.md missing name');
            }
            
            if (!descriptionMatch) {
                errors.push('Main SKILL.md missing description');
            }
            
            // Check for attribution
            if (!skillContent.includes('Compound Engineering')) {
                warnings.push('Attribution to Compound Engineering system not found');
            }
            
            this.validationResults.push({
                test: 'Package Metadata',
                passed: errors.length === 0,
                errors,
                warnings,
                details: {
                    version: versionMatch ? versionMatch[1].trim() : 'unknown',
                    name: nameMatch ? nameMatch[1].trim() : 'unknown'
                }
            });
            
            return errors.length === 0;
            
        } catch (error) {
            this.validationResults.push({
                test: 'Package Metadata',
                passed: false,
                errors: [`Metadata validation failed: ${error.message}`],
                warnings: [],
                details: null
            });
            return false;
        }
    }

    /**
     * Generate final validation report
     */
    generateFinalReport() {
        const allPassed = this.validationResults.every(result => result.passed);
        const totalErrors = this.validationResults.reduce((sum, result) => sum + result.errors.length, 0);
        const totalWarnings = this.validationResults.reduce((sum, result) => sum + result.warnings.length, 0);
        
        console.log('\n' + '='.repeat(80));
        console.log('🏁 FINAL PACKAGE VALIDATION REPORT');
        console.log('='.repeat(80));
        
        if (allPassed) {
            console.log('✅ PACKAGE VALIDATION SUCCESSFUL');
            console.log('🎉 The EARS-workflow skill package is ready for distribution!');
        } else {
            console.log('❌ PACKAGE VALIDATION FAILED');
            console.log('🚨 The package requires fixes before distribution');
        }
        
        console.log('');
        console.log('📊 VALIDATION SUMMARY:');
        console.log(`   Tests Run: ${this.validationResults.length}`);
        console.log(`   Passed: ${this.validationResults.filter(r => r.passed).length}`);
        console.log(`   Failed: ${this.validationResults.filter(r => !r.passed).length}`);
        console.log(`   Total Errors: ${totalErrors}`);
        console.log(`   Total Warnings: ${totalWarnings}`);
        
        console.log('\n📋 DETAILED RESULTS:');
        
        for (const result of this.validationResults) {
            const status = result.passed ? '✅' : '❌';
            console.log(`\n${status} ${result.test}`);
            
            if (result.details) {
                console.log(`   Details: ${JSON.stringify(result.details)}`);
            }
            
            if (result.errors.length > 0) {
                console.log('   🔴 Errors:');
                result.errors.forEach(error => console.log(`     - ${error}`));
            }
            
            if (result.warnings.length > 0) {
                console.log('   🟡 Warnings:');
                result.warnings.forEach(warning => console.log(`     - ${warning}`));
            }
        }
        
        console.log('');
        
        if (allPassed) {
            console.log('🚀 DISTRIBUTION CHECKLIST:');
            console.log('   ✅ All required files present');
            console.log('   ✅ No external dependencies');
            console.log('   ✅ Valid YAML metadata');
            console.log('   ✅ Cross-platform compatibility');
            console.log('   ✅ Multi-environment portability');
            console.log('   ✅ Backward compatibility preserved');
            console.log('');
            console.log('📦 The package can be safely distributed to users.');
        } else {
            console.log('🔧 REQUIRED FIXES:');
            const failedTests = this.validationResults.filter(r => !r.passed);
            failedTests.forEach(test => {
                console.log(`   - ${test.test}: ${test.errors.join(', ')}`);
            });
        }
        
        return {
            success: allPassed,
            results: this.validationResults,
            summary: {
                totalTests: this.validationResults.length,
                passedTests: this.validationResults.filter(r => r.passed).length,
                failedTests: this.validationResults.filter(r => !r.passed).length,
                totalErrors,
                totalWarnings
            }
        };
    }

    /**
     * Run complete validation suite
     */
    async runCompleteValidation() {
        console.log('🎯 Starting comprehensive package validation...\n');
        
        const results = [
            await this.runCompletenessValidation(),
            await this.runMultiEnvironmentValidation(),
            await this.runCrossReferenceValidation(),
            this.validatePackageMetadata()
        ];
        
        return this.generateFinalReport();
    }
}

/**
 * Main validation function
 */
async function runFinalPackageValidation() {
    const validator = new FinalPackageValidator();
    const result = await validator.runCompleteValidation();
    
    if (!result.success) {
        throw new Error(`Final package validation failed: ${result.summary.failedTests} out of ${result.summary.totalTests} tests failed`);
    }
    
    return result;
}

// Export for testing
module.exports = {
    FinalPackageValidator,
    runFinalPackageValidation
};

// Run validation if called directly
if (require.main === module) {
    runFinalPackageValidation()
        .then(() => {
            console.log('\n✅ Final validation completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Final validation failed:', error.message);
            process.exit(1);
        });
}