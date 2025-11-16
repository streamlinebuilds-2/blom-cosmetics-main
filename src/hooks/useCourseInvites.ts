import { useState, useCallback } from 'react';
import { authService } from '../lib/auth';

interface ClaimResult {
  courseSlug: string | null;
  error: string | null;
}

export const useCourseInvites = () => {
  const [loading, setLoading] = useState(false);

  const claimCourseInvite = useCallback(async (token: string): Promise<ClaimResult> => {
    setLoading(true);

    try {
      const authState = authService.getState();

      if (!authState.user) {
        setLoading(false);
        return { courseSlug: null, error: 'User must be logged in to claim invite' };
      }

      console.log('Claiming invite for user:', authState.user.email);

      // Call the redeem-invite function with the token and user info
      const response = await fetch('/.netlify/functions/redeem-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          user_email: authState.user.email,
          user_id: authState.user.id,
          // For existing users, we don't need to pass password
          // The backend will use the user_id to create the enrollment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Redeem invite error:', data);
        setLoading(false);
        return { courseSlug: null, error: data.error || 'Failed to claim invite' };
      }

      console.log('Invite claimed successfully:', data);

      // Map course_id to course slug
      // These are the known course IDs from CourseDetailPage.tsx
      const courseSlugMap: Record<string, string> = {
        'a603be5f-2c56-4e95-9423-8229c8991b40': 'professional-acrylic-training',
        'e700b464-5c16-45b3-bd8b-fe6ba9fdc498': 'online-watercolour-workshop',
        '23666e48-bf0b-4e08-a0c0-9c5ae7838076': 'christmas-watercolor-workshop',
      };

      const courseSlug = courseSlugMap[data.course_id] || 'courses';

      setLoading(false);
      return { courseSlug, error: null };
    } catch (error: any) {
      console.error('Failed to claim invite:', error);
      setLoading(false);
      return { courseSlug: null, error: error.message || 'An unexpected error occurred' };
    }
  }, []);

  return { claimCourseInvite, loading };
};
