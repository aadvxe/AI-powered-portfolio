import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Types matching Supabase Schema
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  gradient: string;
  demo_link: string;
  repo_link: string;
  featured: boolean;
  custom_links?: { label: string; url: string; icon?: string }[];
  year?: number;
  month?: string;
}

export interface SkillData {
  id: string;
  category: string;
  name: string;
  icon: string;
  proficiency: number;
}

export interface ProfileData {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  email: string | null;
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  } | null;
  experiences?: any[]; 
  education?: any[];
  achievements: any[];
  certifications?: any[]; // New field
  resume_url?: string;
  avatar_url?: string;
  custom_sections?: { id: string; title: string; items: any[] }[];
  section_order?: string[];
  hidden_sections?: string[]; // New field for visibility toggles
}

export function useContent() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch Projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true }) // Changed from created_at to display_order
          .order('created_at', { ascending: false }); // Secondary sort
        
        if (projectsError) console.error('Error fetching projects:', projectsError);
        else setProjects(projectsData || []);

        // Fetch Skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        if (skillsError) console.error('Error fetching skills:', skillsError);
        else setSkills(skillsData || []);

        // Fetch Profile (Single Row)
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('*')
          .limit(1)
          .single();

        if (profileError) {
            // Ignore error if row doesn't exist yet (user hasn't set it up)
            console.warn('Error fetching profile:', profileError);
        } else {
            setProfile(profileData);
        }

      } catch (e) {
        console.error('Unexpected error fetching content:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { projects, skills, profile, loading };
}
