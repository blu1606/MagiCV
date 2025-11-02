/**
 * Test script for CV Variant Generator Service
 *
 * Run with: npx tsx scripts/test-cv-variants.ts
 */

import { CVVariantGeneratorService } from '../src/services/cv-variant-generator-service';
import type { Component } from '../src/lib/supabase';
import type { MatchResult, JDMatchingResults } from '../src/lib/types/jd-matching';

// Sample matched components
const sampleMatches: MatchResult[] = [
  // Technical experiences
  {
    jdComponent: {
      id: 'jd-1',
      type: 'skill',
      title: 'React',
      description: 'Frontend development',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-exp-1',
      user_id: 'test-user',
      type: 'experience',
      title: 'Senior Frontend Engineer',
      description: 'Led React development for enterprise applications',
      organization: 'TechCorp Inc.',
      start_date: '2020-01-01',
      end_date: '2023-12-31',
      highlights: [
        'Built 15+ React applications serving 2M+ users',
        'Implemented complex state management with Redux',
        'Optimized bundle size by 60% using code splitting',
      ],
      tags: ['react', 'typescript', 'redux'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 95,
    reasoning: 'Excellent React expertise',
  },
  // Leadership experience
  {
    jdComponent: {
      id: 'jd-2',
      type: 'requirement',
      title: 'Team Leadership',
      description: 'Lead engineering teams',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-exp-2',
      user_id: 'test-user',
      type: 'experience',
      title: 'Engineering Team Lead',
      description: 'Managed team of 8 engineers',
      organization: 'TechCorp Inc.',
      start_date: '2021-06-01',
      end_date: '2023-12-31',
      highlights: [
        'Led team of 8 engineers across 3 products',
        'Mentored 5 junior developers to mid-level',
        'Established agile processes increasing velocity by 40%',
        'Conducted technical interviews and hiring',
      ],
      tags: ['leadership', 'management', 'mentoring'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 88,
    reasoning: 'Strong leadership background',
  },
  // Impact-focused experience
  {
    jdComponent: {
      id: 'jd-3',
      type: 'requirement',
      title: 'Business Impact',
      description: 'Drive measurable business outcomes',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-exp-3',
      user_id: 'test-user',
      type: 'experience',
      title: 'Full Stack Developer',
      description: 'Drove revenue growth through feature development',
      organization: 'StartupXYZ',
      start_date: '2018-01-01',
      end_date: '2019-12-31',
      highlights: [
        'Increased conversion rate by 35% through A/B testing',
        'Generated $2M additional revenue via new payment flows',
        'Reduced customer churn by 25% with improved UX',
      ],
      tags: ['impact', 'metrics', 'business'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 82,
    reasoning: 'Strong business impact',
  },
  // Innovation experience
  {
    jdComponent: {
      id: 'jd-4',
      type: 'skill',
      title: 'Innovation',
      description: 'Develop innovative solutions',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-proj-1',
      user_id: 'test-user',
      type: 'project',
      title: 'AI-Powered Code Review System',
      description: 'Built first-of-its-kind ML-based code reviewer',
      organization: null,
      start_date: '2022-01-01',
      end_date: '2022-06-01',
      highlights: [
        'Pioneered ML model for automated code quality analysis',
        'Reduced code review time by 50%',
        'Published research paper at tech conference',
      ],
      tags: ['innovation', 'ai', 'ml', 'research'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 78,
    reasoning: 'Innovation in AI/ML',
  },
  // Skills
  ...['TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'Redis'].map((skill, i) => ({
    jdComponent: {
      id: `jd-skill-${i}`,
      type: 'skill' as const,
      title: skill,
      description: '',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: `cv-skill-${i}`,
      user_id: 'test-user',
      type: 'skill' as const,
      title: skill,
      description: `Expert in ${skill}`,
      organization: null,
      start_date: null,
      end_date: null,
      highlights: [],
      tags: [skill.toLowerCase()],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 90 - i * 2,
    reasoning: `Strong ${skill} skills`,
  })),
  // Education
  {
    jdComponent: {
      id: 'jd-edu',
      type: 'requirement',
      title: 'Computer Science Degree',
      description: 'BS in CS or related field',
      highlights: [],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    cvComponent: {
      id: 'cv-edu-1',
      user_id: 'test-user',
      type: 'education',
      title: 'Bachelor of Science in Computer Science',
      description: 'Focus on Software Engineering and AI',
      organization: 'MIT',
      start_date: '2014-09-01',
      end_date: '2018-05-01',
      highlights: ['GPA: 3.8/4.0', 'Dean\'s List', 'Senior Thesis in ML'],
      tags: ['cs', 'ai', 'ml'],
      embedding: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    score: 92,
    reasoning: 'Relevant CS degree',
  },
];

const sampleJDMetadata: JDMatchingResults['jdMetadata'] = {
  title: 'Staff Software Engineer',
  company: 'Meta',
  location: 'Menlo Park, CA',
  description: 'Lead development of cutting-edge social media features serving billions of users. Drive technical excellence, mentor engineers, and deliver measurable business impact.',
  seniorityLevel: 'senior',
};

const sampleJDComponents: Component[] = [
  {
    id: 'jd-comp-1',
    user_id: 'jd-user',
    type: 'requirement',
    title: 'React/Frontend Excellence',
    description: 'Deep expertise in React, TypeScript, and modern frontend architecture',
    organization: null,
    start_date: null,
    end_date: null,
    highlights: [],
    tags: ['react', 'typescript', 'frontend'],
    embedding: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'jd-comp-2',
    user_id: 'jd-user',
    type: 'requirement',
    title: 'Team Leadership',
    description: 'Experience leading and mentoring engineering teams',
    organization: null,
    start_date: null,
    end_date: null,
    highlights: [],
    tags: ['leadership', 'management'],
    embedding: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'jd-comp-3',
    user_id: 'jd-user',
    type: 'requirement',
    title: 'Scale & Impact',
    description: 'Built systems serving millions of users with measurable business impact',
    organization: null,
    start_date: null,
    end_date: null,
    highlights: [],
    tags: ['scale', 'impact', 'metrics'],
    embedding: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

async function testCVVariantGeneration() {
  console.log('🧪 Testing CV Variant Generator Service\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Analyze focus areas
    console.log('\n📊 Test 1: Analyze Focus Areas');
    console.log('-'.repeat(80));

    const focusAnalysis = await CVVariantGeneratorService.analyzeFocusAreas(
      sampleMatches,
      sampleJDMetadata,
      sampleJDComponents
    );

    console.log('\n✅ Focus Area Analysis:');
    console.log(`  JD Characteristics:`);
    console.log(`    - Technical: ${focusAnalysis.jdCharacteristics.isTechnical ? '✓' : '✗'}`);
    console.log(`    - Leadership: ${focusAnalysis.jdCharacteristics.requiresLeadership ? '✓' : '✗'}`);
    console.log(`    - Impact: ${focusAnalysis.jdCharacteristics.emphasizesImpact ? '✓' : '✗'}`);
    console.log(`    - Innovation: ${focusAnalysis.jdCharacteristics.requiresInnovation ? '✓' : '✗'}`);
    console.log(`    - Confidence: ${(focusAnalysis.jdCharacteristics.confidence * 100).toFixed(0)}%`);

    console.log(`\n  Candidate Strengths:`);
    console.log(`    - Technical: ${focusAnalysis.componentDistribution.technical.toFixed(1)}`);
    console.log(`    - Leadership: ${focusAnalysis.componentDistribution.leadership.toFixed(1)}`);
    console.log(`    - Impact: ${focusAnalysis.componentDistribution.impact.toFixed(1)}`);
    console.log(`    - Innovation: ${focusAnalysis.componentDistribution.innovation.toFixed(1)}`);

    console.log(`\n  Suggested Focus Areas: ${focusAnalysis.suggestedFocusAreas.join(', ')}`);

    // Test 2: Generate variants
    console.log('\n\n📝 Test 2: Generate CV Variants');
    console.log('-'.repeat(80));

    const variants = await CVVariantGeneratorService.generateVariants(
      sampleMatches,
      sampleJDMetadata,
      focusAnalysis.suggestedFocusAreas
    );

    console.log(`\n✅ Generated ${variants.length} variants:`);
    variants.forEach((variant, i) => {
      console.log(`\n  ${i + 1}. ${variant.title} (${variant.focusArea})`);
      console.log(`     Score: ${variant.score}/100`);
      console.log(`     Components: ${variant.selectedComponents.experience.length} exp, ${variant.selectedComponents.skills.length} skills`);
      console.log(`     Strengths: ${variant.strengthAreas.join(', ')}`);
      console.log(`     Summary: ${variant.professionalSummary.substring(0, 100)}...`);
    });

    // Test 3: Compare variants
    console.log('\n\n🏆 Test 3: Compare Variants');
    console.log('-'.repeat(80));

    const recommendation = CVVariantGeneratorService.compareVariants(variants);

    console.log(`\n✅ Recommended Variant: ${recommendation.recommended.title}`);
    console.log(`   Score: ${recommendation.recommended.score}/100`);
    console.log(`   Focus: ${recommendation.recommended.focusArea}`);

    console.log('\n  Comparison:');
    recommendation.comparison.forEach(({ variant, rank, prosAndCons }) => {
      console.log(`\n    #${rank}. ${variant.title}`);
      console.log(`        Pros:`);
      prosAndCons.pros.forEach(pro => console.log(`          ✓ ${pro}`));
      console.log(`        Cons:`);
      prosAndCons.cons.forEach(con => console.log(`          ✗ ${con}`));
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testCVVariantGeneration();
