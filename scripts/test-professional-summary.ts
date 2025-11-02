/**
 * Test script for Professional Summary Service
 *
 * Run with: npx tsx scripts/test-professional-summary.ts
 */

import { ProfessionalSummaryService } from '../src/services/professional-summary-service';
import type { Component } from '../src/lib/supabase';
import type { MatchResult, JDMatchingResults } from '../src/lib/types/jd-matching';

// Sample matched components from a JD matching
const sampleMatches: MatchResult[] = [
  {
    jdComponent: {
      id: 'jd-1',
      type: 'skill',
      title: 'React',
      description: 'Frontend development with React',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-1',
      user_id: 'test-user',
      type: 'experience',
      title: 'Senior Frontend Engineer',
      description: 'Led development of enterprise React applications',
      organization: 'TechCorp Inc.',
      start_date: '2020-01-01',
      end_date: '2023-12-31',
      highlights: [
        'Built and deployed 15+ production React applications serving 2M+ users',
        'Led team of 5 engineers in agile development',
        'Improved application performance by 40% through optimization',
      ],
      tags: ['react', 'typescript', 'leadership'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 92,
    reasoning: 'Strong match on React expertise',
  },
  {
    jdComponent: {
      id: 'jd-2',
      type: 'skill',
      title: 'Node.js',
      description: 'Backend development',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-2',
      user_id: 'test-user',
      type: 'experience',
      title: 'Full Stack Developer',
      description: 'Built scalable Node.js APIs',
      organization: 'StartupXYZ',
      start_date: '2018-01-01',
      end_date: '2019-12-31',
      highlights: [
        'Architected microservices handling 100K+ requests/day',
        'Implemented RESTful APIs with Node.js and Express',
      ],
      tags: ['nodejs', 'api', 'microservices'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 88,
    reasoning: 'Strong Node.js background',
  },
  {
    jdComponent: {
      id: 'jd-3',
      type: 'skill',
      title: 'TypeScript',
      description: 'Type-safe development',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-3',
      user_id: 'test-user',
      type: 'skill',
      title: 'TypeScript',
      description: 'Expert in TypeScript for large-scale applications',
      organization: null,
      start_date: null,
      end_date: null,
      highlights: [],
      tags: ['typescript', 'javascript'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 95,
    reasoning: 'Perfect TypeScript match',
  },
  {
    jdComponent: {
      id: 'jd-4',
      type: 'requirement',
      title: 'AWS',
      description: 'Cloud infrastructure',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-4',
      user_id: 'test-user',
      type: 'skill',
      title: 'AWS (Amazon Web Services)',
      description: 'EC2, S3, Lambda, CloudFormation',
      organization: null,
      start_date: null,
      end_date: null,
      highlights: [],
      tags: ['aws', 'cloud', 'devops'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 85,
    reasoning: 'Good AWS knowledge',
  },
];

const sampleJDMetadata: JDMatchingResults['jdMetadata'] = {
  title: 'Senior Full Stack Engineer',
  company: 'Google',
  location: 'Mountain View, CA',
  description: 'Build scalable web applications',
  seniorityLevel: 'senior',
};

async function testProfessionalSummaryGeneration() {
  console.log('🧪 Testing Professional Summary Service\n');
  console.log('=' .repeat(80));

  try {
    // Test 1: Generate from matches
    console.log('\n📝 Test 1: Generate summary from matched components');
    console.log('-'.repeat(80));

    const summary = await ProfessionalSummaryService.generateFromMatches(
      sampleMatches,
      sampleJDMetadata,
      'senior'
    );

    console.log('\n✅ Generated Summary:');
    console.log(summary);

    // Test 2: Validate summary
    console.log('\n\n📝 Test 2: Validate summary quality');
    console.log('-'.repeat(80));

    const validation = ProfessionalSummaryService.validateSummary(summary);

    console.log('\nValidation Results:');
    console.log(`  ✓ Valid: ${validation.isValid ? '✅' : '❌'}`);
    console.log(`  ✓ Word Count: ${validation.wordCount} words`);
    console.log(`  ✓ Has Years: ${validation.hasYearsExperience ? '✅' : '❌'}`);
    console.log(`  ✓ Has Skills: ${validation.hasSkills ? '✅' : '❌'}`);
    console.log(`  ✓ Has Objective: ${validation.hasObjective ? '✅' : '❌'}`);

    if (validation.issues.length > 0) {
      console.log('\n  Issues:');
      validation.issues.forEach(issue => console.log(`    - ${issue}`));
    }

    // Test 3: Test with raw components
    console.log('\n\n📝 Test 3: Generate from raw components');
    console.log('-'.repeat(80));

    const experiences: Component[] = sampleMatches
      .filter(m => m.cvComponent?.type === 'experience')
      .map(m => m.cvComponent!);

    const skills: Component[] = sampleMatches
      .filter(m => m.cvComponent?.type === 'skill')
      .map(m => m.cvComponent!);

    const summary2 = await ProfessionalSummaryService.generateFromComponents(
      experiences,
      skills,
      'Senior Full Stack Engineer',
      'Google'
    );

    console.log('\n✅ Generated Summary (from components):');
    console.log(summary2);

    const validation2 = ProfessionalSummaryService.validateSummary(summary2);
    console.log(`\nValidation: ${validation2.isValid ? '✅ Valid' : '❌ Invalid'} (${validation2.wordCount} words)`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testProfessionalSummaryGeneration();
