export async function submitReview(form: {
  product_slug: string;
  reviewer_name: string;
  reviewer_email?: string;
  title?: string;
  body: string;
  rating?: number;
  photos?: string[];
  is_verified_buyer?: boolean;
  order_id?: string;
}) {
  const url = 'https://blom-admin-1.netlify.app/.netlify/functions/reviews-intake';
  
  // Validate rating is present and valid
  if (!form.rating || form.rating < 1 || form.rating > 5) {
    throw new Error('Please select a valid rating (1-5 stars)');
  }

  // Validate body is present
  if (!form.body || form.body.trim().length === 0) {
    throw new Error('Please write a review');
  }

   // Send a superset of fields for backward/forward compatibility across function versions.
   // - Include both product_slug and product_id (slug form) so either is accepted.
   // - Include both name/reviewer_name and email/reviewer_email.
   // - Include both comment and body.
   // - Force rating to a number.
   const payload = {
     product_id: form.product_slug,                               // some handlers expect product_id (slug allowed)
     product_slug: form.product_slug,                             // others expect product_slug
     name: (form.reviewer_name && form.reviewer_name.trim()) ? form.reviewer_name.trim() : 'Anonymous',
     reviewer_name: (form.reviewer_name && form.reviewer_name.trim()) ? form.reviewer_name.trim() : 'Anonymous',
     email: form.reviewer_email || null,
     reviewer_email: form.reviewer_email || null,
     rating: Number(form.rating),
     title: (form.title?.trim() || null),
     comment: form.body.trim(),                                   // new handler prefers "comment"
     body: form.body.trim(),                                      // older handler expects "body"
     // Optionals not strictly required for intake
     order_id: form.order_id || null
   };

  console.log('Sending review to:', url);
  console.log('Payload:', payload);
  console.log('Payload.rating typeof:', typeof (payload as any).rating);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', responseText);

    if (!res.ok) {
      let errorMessage = 'Failed to submit review';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { ok: true };
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
}


