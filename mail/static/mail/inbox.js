document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#email-detail').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    // Getting email by mailbox parameteres (inbox,sent,archieve)
    fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(email => {
      email.forEach(element=>{
        // Create some html tags to embed content.
        const div = document.createElement('div');
        const link = document.createElement('a');
        const timeStamp = document.createElement('span');
        const from = document.createElement('span');
        
        // Add class for styling.
        div.classList.add('goodview');
        
        // Editing the content of html tags and adding events.
        link.innerHTML = element.subject;
        link.addEventListener('click',() => viewMail(element.id,mailbox,element.subject,element.sender));
        link.classList.add('link-class');
        from.classList.add('right');

        timeStamp.innerHTML ="Sent by: " + element.timestamp;
        from.innerHTML ="From: " + element.sender;

        div.append(timeStamp);
        div.append(link);
        div.append(from);
        // Check for if mail read or unread
        if (element.read){
          div.classList.add('read');
          link.classList.remove('link-class');
          link.classList.add('readlink');
        }
        else{
          div.classList.add('unread');
        }
        document.querySelector('#emails-view').append(div);
      })
    });
}


document.querySelector('#send_button').addEventListener('click',()=>{
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
   // Function for send mail
    newMail(recipients,subject,body);
  });



function newMail(newrecipients,newsubject,newbody){
  // Send email with fetch api.
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: newrecipients,
          subject: newsubject,
          body: newbody
      })
    })
    .then(response => response.json())
    .then(result => {
    
        document.querySelector('#emails-view').innerHTML += `<p> ${result.message} </p>`;
    });

      load_mailbox('sent');
  
}

function viewMail(id,mailbox,subject,recipients){

   // Show detail view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    document.querySelector('#email-detail').innerHTML = "";
    // Get one email and show it.
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {

      fetch(`/emails/${id}`,{
        method: "PUT",
        body: JSON.stringify({
          read: true, 
        })
      });
      
      const content = document.createElement('div');
      const timeStamp = document.createElement('div');
      const title = document.createElement('h3');
      const topic = document.createElement('div');
      const sender = document.createElement('div');
      const back = document.createElement('a');

      timeStamp.innerHTML = email.timestamp;
      title.innerHTML = email.subject;
      topic.innerHTML = email.body;
      sender.innerHTML ="To: " + email.recipients;
      back.innerHTML = "<- Back";

      title.classList.add('email-subject');
      topic.classList.add('email-body');
      back.addEventListener('click',() => load_mailbox(mailbox));
      back.style.cursor = "pointer";
      back.style.padding = 10 + "px";
      back.style.color = "blue";

      content.append(back);
      content.append(timeStamp);
      content.append(title);
      content.append(topic);
      content.append(sender);
  
      if (mailbox != "sent"){
      const reply = document.createElement('button');
        // Add a button for reply
      reply.innerHTML = "Reply"; 
      reply.style.position = "absolute";
      reply.style.left = 80+"%";
      // Archieve or unarchieve an email. If a mail is archived, it is removed from the inbox and put in the archive box.
        if (!email.archived){
          const archived = document.createElement('button');
          archived.innerHTML = "Archive";
          archived.addEventListener('click',() => ArchiveFunc(id));
          content.append(archived);
        }else{
          const unarchived = document.createElement('button');
          unarchived.innerHTML = "Unarchive";
          unarchived.addEventListener('click',() => UnArchiveFunc(id));
          content.append(unarchived);
        }
        reply.addEventListener('click',() => ReplyMail(subject,recipients));
        content.append(reply);
    }
    

      document.querySelector('#email-detail').append(content);
});



}


function ArchiveFunc(id){

    fetch(`emails/${id}`,{
      method: "PUT",
      body: JSON.stringify({
        archived: true,
      })
    })
    load_mailbox('inbox');
}


function UnArchiveFunc(id){
  
  fetch(`emails/${id}`,{
      method: "PUT",
      body: JSON.stringify({
        archived: false,
      })
    })
    load_mailbox('inbox');
}

function ReplyMail(subject,recipients){
   // Show compose view and hide other views
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#email-detail').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';
 
   // Fill the subject and recipients field and clear the other one.
   document.querySelector('#compose-recipients').value = `${recipients}`;
  
  // Checking if an email is already a reply email
   let sbjct = "";
   for (let i=0;i<2;i++){
     sbjct += String(subject[i]);
   }
   if (sbjct.toLowerCase() == "re"){
    document.querySelector('#compose-subject').value = `${subject}`;
   }else{
    document.querySelector('#compose-subject').value = `Re: ${subject}`;
   }
   
   document.querySelector('#compose-body').value = '';
}
