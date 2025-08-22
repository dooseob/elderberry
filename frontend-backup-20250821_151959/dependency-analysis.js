/**
 * 의존성 분석 스크립트
 * 프로젝트의 의존성 구조를 분석하고 순환 의존성을 탐지
 */
const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor(srcPath) {
    this.srcPath = srcPath;
    this.dependencies = new Map();
    this.layers = {
      app: 'app',
      pages: 'pages', 
      widgets: 'widgets',
      features: 'features',
      entities: 'entities',
      shared: 'shared',
    };
  }

  // 파일에서 import 문 추출
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
      const imports = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // 상대 경로를 절대 경로로 변환
        if (importPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(filePath), importPath);
          imports.push(path.relative(this.srcPath, resolvedPath));
        } else if (!importPath.startsWith('react') && !importPath.startsWith('@') && !importPath.includes('node_modules')) {
          imports.push(importPath);
        }
      }

      return imports;
    } catch (error) {
      return [];
    }
  }

  // 디렉토리 재귀 탐색
  scanDirectory(dirPath) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.scanDirectory(itemPath));
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return files;
  }

  // 파일의 계층 결정
  getLayer(filePath) {
    const relativePath = path.relative(this.srcPath, filePath);
    const pathParts = relativePath.split(path.sep);
    
    if (pathParts.length > 0) {
      const firstPart = pathParts[0];
      return this.layers[firstPart] || 'unknown';
    }
    
    return 'unknown';
  }

  // 의존성 분석 실행
  analyze() {
    console.log('🔍 의존성 분석을 시작합니다...');
    
    const files = this.scanDirectory(this.srcPath);
    console.log(`📁 ${files.length}개 파일을 분석합니다.`);

    // 각 파일의 의존성 수집
    for (const file of files) {
      const imports = this.extractImports(file);
      const relativePath = path.relative(this.srcPath, file);
      
      this.dependencies.set(relativePath, {
        layer: this.getLayer(file),
        imports: imports.map(imp => ({
          path: imp,
          layer: this.getLayer(path.join(this.srcPath, imp)),
        })),
      });
    }

    return this.generateReport();
  }

  // 순환 의존성 탐지
  findCycles() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = this.dependencies.get(node);
      if (deps) {
        for (const imp of deps.imports) {
          if (this.dependencies.has(imp.path)) {
            dfs(imp.path, [...path]);
          }
        }
      }

      recursionStack.delete(node);
      path.pop();
    };

    for (const node of this.dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  // 계층 위반 탐지
  findLayerViolations() {
    const layerOrder = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];
    const violations = [];

    for (const [filePath, deps] of this.dependencies) {
      const fileLayer = deps.layer;
      const fileLayerIndex = layerOrder.indexOf(fileLayer);

      for (const imp of deps.imports) {
        const impLayerIndex = layerOrder.indexOf(imp.layer);
        
        if (impLayerIndex > fileLayerIndex) {
          violations.push({
            file: filePath,
            fileLayer,
            import: imp.path,
            importLayer: imp.layer,
            violation: `${fileLayer} layer cannot import from ${imp.layer} layer`,
          });
        }
      }
    }

    return violations;
  }

  // 분석 리포트 생성
  generateReport() {
    const cycles = this.findCycles();
    const violations = this.findLayerViolations();
    
    const layerStats = {};
    for (const layer of Object.values(this.layers)) {
      layerStats[layer] = {
        files: 0,
        dependencies: 0,
      };
    }

    for (const [, deps] of this.dependencies) {
      if (layerStats[deps.layer]) {
        layerStats[deps.layer].files++;
        layerStats[deps.layer].dependencies += deps.imports.length;
      }
    }

    return {
      totalFiles: this.dependencies.size,
      layerStats,
      cycles: cycles.length,
      cycleDetails: cycles,
      violations: violations.length,
      violationDetails: violations,
      summary: {
        healthy: cycles.length === 0 && violations.length === 0,
        issues: cycles.length + violations.length,
      },
    };
  }

  // 리포트 출력
  printReport(report) {
    console.log('\n📊 의존성 분석 결과');
    console.log('='.repeat(50));
    
    console.log(`\n📁 전체 파일 수: ${report.totalFiles}`);
    
    console.log('\n📈 계층별 통계:');
    for (const [layer, stats] of Object.entries(report.layerStats)) {
      console.log(`  ${layer}: ${stats.files}개 파일, ${stats.dependencies}개 의존성`);
    }

    if (report.cycles > 0) {
      console.log(`\n🔄 순환 의존성: ${report.cycles}개 발견`);
      report.cycleDetails.slice(0, 5).forEach((cycle, index) => {
        console.log(`  ${index + 1}. ${cycle.join(' → ')}`);
      });
      if (report.cycleDetails.length > 5) {
        console.log(`  ... ${report.cycleDetails.length - 5}개 더`);
      }
    } else {
      console.log('\n✅ 순환 의존성 없음');
    }

    if (report.violations > 0) {
      console.log(`\n⚠️  계층 위반: ${report.violations}개 발견`);
      report.violationDetails.slice(0, 5).forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.file} → ${violation.import}`);
        console.log(`     ${violation.violation}`);
      });
      if (report.violationDetails.length > 5) {
        console.log(`  ... ${report.violationDetails.length - 5}개 더`);
      }
    } else {
      console.log('\n✅ 계층 위반 없음');
    }

    console.log('\n📋 요약:');
    if (report.summary.healthy) {
      console.log('✅ 의존성 구조가 건강합니다!');
    } else {
      console.log(`❌ ${report.summary.issues}개의 문제가 발견되었습니다.`);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const srcPath = path.join(__dirname, 'src');
  const analyzer = new DependencyAnalyzer(srcPath);
  
  try {
    const report = analyzer.analyze();
    analyzer.printReport(report);
    
    // JSON 리포트 저장
    fs.writeFileSync(
      path.join(__dirname, 'dependency-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 상세 리포트가 dependency-report.json에 저장되었습니다.');
    
    // 문제가 있으면 종료 코드 1로 종료
    if (!report.summary.healthy) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 의존성 분석 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

module.exports = DependencyAnalyzer;