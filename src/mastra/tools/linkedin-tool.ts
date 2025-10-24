import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * LinkedIn MCP Tool - Thu thập dữ liệu từ LinkedIn profile
 * NOTE: This is a simplified version that accepts structured data
 * For web crawling version, see the test/ project's linkedin-crawler service
 */
export const linkedinTool = createTool({
  id: "linkedin-processor",
  description: "Process LinkedIn profile data from structured input",
  
  inputSchema: z.object({
    profileUrl: z.string().describe("LinkedIn profile URL"),
    profileData: z.object({
      headline: z.string().optional(),
      summary: z.string().optional(),
      experiences: z.array(z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
        skills: z.array(z.string()).optional(),
      })).optional(),
      education: z.array(z.object({
        school: z.string(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      })).optional(),
      skills: z.array(z.object({
        name: z.string(),
        endorsements: z.number().optional(),
      })).optional(),
      certifications: z.array(z.object({
        name: z.string(),
        issuer: z.string(),
        issueDate: z.string().optional(),
        expirationDate: z.string().optional(),
        credentialId: z.string().optional(),
        url: z.string().optional(),
      })).optional(),
      languages: z.array(z.object({
        name: z.string(),
        proficiency: z.string().optional(),
      })).optional(),
    }),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      profile: z.object({
        url: z.string(),
        headline: z.string().optional(),
        summary: z.string().optional(),
      }),
      experiences: z.array(z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
        skills: z.array(z.string()).optional(),
        duration: z.string().optional(),
      })),
      education: z.array(z.object({
        school: z.string(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      })),
      skills: z.array(z.object({
        name: z.string(),
        endorsements: z.number().optional(),
      })),
      certifications: z.array(z.object({
        name: z.string(),
        issuer: z.string(),
        issueDate: z.string().optional(),
        expirationDate: z.string().optional(),
        credentialId: z.string().optional(),
        url: z.string().optional(),
      })),
      languages: z.array(z.object({
        name: z.string(),
        proficiency: z.string().optional(),
      })),
      components: z.object({
        totalExperiences: z.number(),
        totalEducation: z.number(),
        totalSkills: z.number(),
        totalCertifications: z.number(),
      }),
    }).optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    try {
      console.log(`🔍 Processing LinkedIn profile: ${context.profileUrl}`);

      const { profileData, profileUrl } = context;

      // Calculate work duration for each experience
      const processedExperiences = (profileData.experiences || []).map(exp => {
        let duration = '';
        if (exp.startDate) {
          const start = new Date(exp.startDate);
          const end = exp.endDate ? new Date(exp.endDate) : new Date();
          
          const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth());
          const years = Math.floor(months / 12);
          const remainingMonths = months % 12;
          
          if (years > 0) {
            duration += `${years} year${years > 1 ? 's' : ''}`;
          }
          if (remainingMonths > 0) {
            if (years > 0) duration += ' ';
            duration += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
          }
        }

        return {
          ...exp,
          duration: duration || undefined,
        };
      });

      const experiences = processedExperiences;
      const education = profileData.education || [];
      const skills = profileData.skills || [];
      const certifications = profileData.certifications || [];
      const languages = profileData.languages || [];

      const data = {
        profile: {
          url: profileUrl,
          headline: profileData.headline,
          summary: profileData.summary,
        },
        experiences,
        education,
        skills,
        certifications,
        languages,
        components: {
          totalExperiences: experiences.length,
          totalEducation: education.length,
          totalSkills: skills.length,
          totalCertifications: certifications.length,
        },
      };

      console.log(`✅ Processed ${data.components.totalExperiences} experiences, ${data.components.totalSkills} skills`);

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('❌ LinkedIn process error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

