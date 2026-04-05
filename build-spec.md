# Tristas Treats Build Specification

## 1. Product Direction

This product is not just a public website. It is:

- a public storefront for Tristas Treats
- a private owner workspace for Trista
- a technical admin workspace for Slender
- a full in-site email/inbox workflow for `trista@tristastreats.com`
- a lightweight CRM/order management system
- a content management system for the public site
- an internal analytics dashboard

The system should be built with Render in mind as a backend-hosted application.

## 2. Roles And Access

### Launch Accounts

- `tristamcc88@yahoo.com` -> `Owner`
- `slender@slendystuff.com` -> `TechAdmin`

### Role Rules

- `Owner` and `TechAdmin` have identical full access at launch
- `Owner` represents Trista as the business owner and primary customer-facing user
- `TechAdmin` exists as a separate role for future permission flexibility
- more roles may be added later, but are not required at launch

### Login Rules

- both seeded accounts start with the same temporary password at setup
- both accounts must change password on first successful login
- email/login name change is not forced on first login
- no customer accounts exist at launch

## 3. Security And Recovery

### Password And Access

- self-service password reset by email exists at launch
- `TechAdmin` has controlled manual recovery/reset ability for the `Owner` account
- two-factor authentication is deferred for launch
- future plan: add app-based authentication for both `Owner` and `TechAdmin`

### Sessions

- `Owner` account should be allowed to stay signed in
- all non-owner accounts should use a short session timeout

### Logging And Safety

- important admin actions must be audit logged
- deleted content should use trash/restore instead of immediate permanent delete
- basic admin export/backups should exist at launch

## 4. Email And Owner Workspace

### Core Model

- `trista@tristastreats.com` is the in-site mailbox/workspace
- Trista should use the website as her one-stop workspace
- the site should be the primary place for:
  - editing the site
  - checking traffic
  - managing listings, descriptions, and links
  - handling full email workflow
- `admin@tristastreats.com` is not part of the in-site inbox
- mail to `admin@tristastreats.com` can forward externally to `slender@slendystuff.com`
- `TechAdmin` should not have an in-site personal mailbox

### Inbox Behavior

- full standalone inbox behavior is required inside the owner workspace
- synchronized mailbox data should be stored locally for speed and control
- full folder support exists at launch
- app-owned workflow folders:
  - `started`
  - `inprogress`
  - `completed`
- those workflow folders are app-owned, not mailbox-mirrored folders

### Email Conversation Rules

- every inbound customer email automatically becomes a tracked conversation record
- the system supports multiple tracked conversations per customer
- new inbound email conversations default to `started`
- stage movement is manual only at launch
- replies from the owner workspace send as real email from `trista@tristastreats.com`
- incoming customer replies should auto-attach to the existing tracked conversation whenever possible
- full attachment support exists at launch
- draft email support exists at launch
- sent emails are immutable after send

### Contact Model

- the email workspace includes a `Contacts` section
- one contact can have multiple linked email addresses
- thread display should show the contact name plus the active email in parentheses
- unknown senders automatically create contacts
- contact merge/cleanup is supported later

### Inbox Search And Alerts

- launch search covers:
  - contact name
  - email address
  - subject line
  - message body
  - attachment filename
  - workflow stage
- new inbound email notifications use:
  - in-app notifications
  - browser notifications

## 5. Inquiries, Orders, And CRM

### Structural Model

- email and order/task management are separate sections with linking between them
- email conversations can:
  - create a new order/project
  - link to an existing order/project
  - remain standalone with no order attached

### Order Statuses

- order/project records have their own separate status system
- launch order/project statuses:
  - `inquiry`
  - `quoting`
  - `booked`
  - `designing`
  - `inprogress`
  - `ready`
  - `completed`
  - `cancelled`

### Order/Project Fields

Every order/project record should support:

- customer/contact
- event date
- pickup or delivery date/time
- order title
- description/notes
- status
- quoted price
- final price
- deposit required
- deposit paid
- inspiration/reference images
- internal notes
- linked email conversations

### Pricing Model

- support both freeform totals/notes and optional itemized line items
- line-item pricing fields are available but not required

### Order Assets

- order/project records support their own uploads in addition to email attachments

### Calendar

- calendar/schedule view exists at launch
- Trista must be able to manually create orders with no linked email conversation
- this supports transition from texts, calls, Facebook messages, and other off-site sources
- calendar and availability remain private/internal only
- availability is never publicly displayed
- Trista can create an order before the contact is fully entered

## 6. Public Inquiry Intake

### Intake Channels

- public intake supports both:
  - website inquiry/order form
  - direct email intake

### Intake Record Model

- public form submissions create inquiries first, not full orders immediately

### Inquiry Form Fields

Launch inquiry form fields:

- name
- email
- phone
- whether phone is text-capable
- preferred contact method
- event date
- optional pickup time
- order type
- short description/details
- optional budget
- optional inspiration images

### Inquiry Form Field Rules

- phone number is required
- preferred contact method is included
- event date is collected
- pickup time is optional
- order type uses both:
  - fixed list with `Other`
  - freeform details in description
- budget is optional
- inspiration uploads:
  - images only
  - max 5 images
  - stored directly into the linked inquiry/workspace immediately

### Confirmation Email

- public inquiries trigger an automatic confirmation email from `trista@tristastreats.com`
- confirmation email should:
  - confirm receipt
  - say Trista will review and reply
  - remind the customer to watch for replies from `trista@tristastreats.com`
- the system must never automatically promise a response time

## 7. Public Site Structure

### Launch Public Pages

- Home
- Gallery
- About
- Inquiry / Order
- Reviews
- Abundance / Available Now
- Contact

### Public Content Rules

- public site copy and section visibility are editable from admin across launch pages
- availability should never be displayed publicly
- the site should never publicly show how booked Trista is or expose internal workload pressure

## 8. CMS And Editing Model

### Editing Philosophy

- Trista uses structured content fields
- TechAdmin has advanced editing mode in addition to the structured editor

### Homepage Editing

For Trista, homepage editing uses structured fields such as:

- hero headline
- hero subtext
- featured images
- call-to-action text
- contact highlights
- editable section blocks

### Publishing Workflow

- public content changes use draft/publish workflow
- preview before publish exists

### Under Construction

- under-construction mode is a simple site-wide admin toggle
- under-construction page content is editable from admin

## 9. Gallery Management

- full gallery management exists in admin at launch
- gallery entries support multiple images
- gallery entries can link directly to order/project records
- when an order reaches `completed`, the system should prompt/suggest creating a gallery entry
- nothing auto-publishes

Gallery management supports:

- upload images
- title them
- add descriptions
- reorder them
- hide/unhide them
- optional tags/categories

## 10. Reviews And Testimonials

- reviews/testimonials support both:
  - admin-entered reviews
  - customer-submitted reviews
- customer-submitted reviews require approval before public display
- public review submission is allowed
- admin can link reviews to contacts/orders later
- reviews support optional images
- admin can link reviews to gallery images/entries
- review image uploads:
  - multiple images allowed
  - max 3 images

## 11. Abundance / Available Now

- public site includes an admin-managed `Abundance / Available Now` section at launch
- abundance items support:
  - posted price
  - availability status
  - expiration/hide date

## 12. Analytics

Analytics are surfaced inside the owner workspace itself.

Launch analytics should include:

- total visits
- top pages
- inquiry submissions
- gallery views
- traffic sources
- conversion rate to inquiry

## 13. Deferred / Later Scope

The following are intentionally deferred:

- two-factor authentication at launch
- customer accounts
- mailbox folder mirroring back to the external mail host
- automatic workflow stage movement
- automatic response-time commitments

## 14. Build Readiness Summary

This specification is sufficient to begin planning implementation.

The product should be approached as:

- a backend-hosted full-stack application
- with a private owner workspace for Trista
- a technical admin role for Slender
- a built-in synced email client for Trista's mailbox
- a CRM/order/inquiry workflow
- a structured CMS with preview/publish controls
- integrated gallery, reviews, abundance, and analytics
