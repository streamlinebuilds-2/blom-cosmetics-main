# WhatsApp Message Template – Orkney Course Booking Notification

**Purpose:** Notify Yolanda (Blom Orkney) when a student pays a deposit for a course at her location.

**Recipient:** +27 73 151 8407 (Yolanda Botha – Blom Orkney)

**Trigger:** Automated — fires when PayFast confirms payment for an in-person course booking where the selected instructor/location is Orkney.

---

## Template (for Meta Business Manager approval)

**Template Name:** `blom_orkney_course_booking`  
**Category:** UTILITY  
**Language:** English (en)

### Header (optional)
```
New Course Booking 🎉
```

### Body
```
Hi Yolanda! A new student has booked and paid their deposit for a course at Blom Orkney.

*Student:* {{1}}
*Email:* {{2}}
*Phone:* {{3}}

*Course:* {{4}}
*Package:* {{5}}
*Date:* {{6}}
*Deposit Paid:* R{{7}}

Please add this student to your list and confirm their spot! 💅

_This is an automated notification from Blom Cosmetics._
```

### Variable Mapping (n8n)
| Variable | Value |
|----------|-------|
| `{{1}}` | `buyer_name` |
| `{{2}}` | `buyer_email` |
| `{{3}}` | `buyer_phone` |
| `{{4}}` | `course_title` |
| `{{5}}` | `selected_package` |
| `{{6}}` | `selected_date` |
| `{{7}}` | `amount_paid` |

---

## Example Message (filled in)

> Hi Yolanda! A new student has booked and paid their deposit for a course at Blom Orkney.
>
> **Student:** Sarah van der Merwe  
> **Email:** sarah@example.com  
> **Phone:** +27 82 123 4567
>
> **Course:** Rubber Base Perfection & Russian Manicure  
> **Package:** Deluxe  
> **Date:** July 2026 (11–13 Jul)  
> **Deposit Paid:** R1,800
>
> Please add this student to your list and confirm their spot! 💅
>
> _This is an automated notification from Blom Cosmetics._

---

## Notes

- This is an **outbound notification** (not a reply to a student message), so it **requires Meta template approval** before use.
- Submit the template via your WhatsApp Business Manager at business.facebook.com.
- Once approved, update the n8n workflow (`docs/n8n-orkney-booking-notification.json`) to use the approved template name and variable format instead of free-form text.
- The n8n workflow currently sends a free-form message — this only works if Yolanda has messaged Blom first within the last 24 hours. Use the approved template for reliable outbound delivery.
