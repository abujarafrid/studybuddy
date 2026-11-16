# StudyBuddy: Peer Tutoring and Study Partner Finder

CSC 3215: Web Technologies, Fall 26-27. Midterm Project Submission (Prototype Part 1).

StudyBuddy helps university students find peer tutors and study partners by department, course, availability and preferred study method (online, in-person or hybrid).

## Technologies
Pure HTML, CSS and JavaScript only. No framework or library is used. (PHP + MySQL come in later submissions.)

## How to run
Open `index.html` in a browser. No build step or server is needed.
All forms use `action="#"` for now, so nothing is saved until the PHP part.

## What is included
- **HTML:** all required pages for the four user types plus common pages.
- **CSS:** `css/style.css` styles every page consistently (header, navigation, forms, tables, badges, mobile layout).
- **JavaScript:** `js/app.js` adds form validation, password show/hide and strength meter, live table filtering, row actions (accept, reject, cancel, delete), collapsible edit forms and toast messages.

## Folder = user type = group member
| Folder | Owner | Pages |
|---|---|---|
| `/` (common) | Group Leader | index, register, login, forgot/reset/change password, profile |
| `student/` | Member 1 | dashboard, find-partners, partner-requests, book-session, my-sessions, review |
| `tutor/` | Member 2 | dashboard, tutor-profile, availability, session-requests, resources |
| `coordinator/` | Member 3 | dashboard, tutor-applications, courses, reports, activity |
| `admin/` | Member 4 | dashboard, users, departments, announcements, analytics |

## Documents
The updated project proposal is in [`docs/StudyBuddy_Project_Proposal.docx`](docs/StudyBuddy_Project_Proposal.docx).

## Group
| SL | Student ID | Name | Role |
|---|---|---|---|
| 1 | | | Group Leader |
| 2 | | | Member |
| 3 | | | Member |
| 4 | | | Member |
