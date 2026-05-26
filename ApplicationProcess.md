now in here, when clicked on the easy apply, should go to the application process, 

first the user should enter their RMIS_ID or NIC or both, and do a search, which should call the info.rotaract3220.org, as here, and request for the record where RMIS_ID matches the membership_id in the table club_membership_data or NIC matches the nic_pp, and once the data is back, if theres a matching data record is found show it as a selectable card, so if its the user, he can click on a button to go ahead to the 2nd step.

2nd step : 

Display full name : full_name from response [non changable]
preferred calling name : let the user enter this
email : let the user enter this
mobile : let the user enter this
NIC : nic_pp from the response [non changable] 

then the CVs.

[when loading the page, search of the storage for CV files named with RMIS_ID_1.png/RMIS_ID_2.png/RMIS_ID_3.png, if there are display the file as selectable, which they can select quickly and complete the application. which then send that CV link along with the other data towards the company]

A user is allowed to have 3 <5mb CVs stored and use,
 - if no pre cvs are there, then simply have the upload file component, a nice drag and drop option
 - if there are 1 or more cvs, first display them as a selectable format also with view button too to view the cvs there, and then below there add a new CV. also the old cvs should have an option to replace options.

Then simply send the application to the company.

Do the info.rotaract3220.org api call through a next js api call, but the verification process do it in the client side, not the server side.



The Problem

Old job applications reference userId_1.pdf (or its public URL)
User deletes and replaces userId_1.pdf
Old applications now point to the NEW CV, not the one they actually applied with
Or worse, if URLs change, the link breaks entirely

Solutions
Option 1: Snapshot Approach (Recommended)
When user applies to a job, copy/duplicate their CV to a permanent location:
/cvs/{userId}_1.pdf          // User's active CVs
/cvs/{userId}_2.pdf

/applications/{applicationId}.pdf  // Immutable snapshots
How it works:

User selects CV #1 to apply
System copies that file to /applications/{applicationId}.pdf
Job application stores this permanent URL
User can now delete/replace their active CVs without affecting past applications

Pros: Clean, applications never break, users have full control
Cons: More storage usage (but PDFs are small, this is negligible)