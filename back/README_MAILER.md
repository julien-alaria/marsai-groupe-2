# Reglage pour l'expéditeur de l'email

## Dans la fonction sendMail du controller EmailController.js

async function sendMail(to, subject, html) {
  let info = await transporter.sendMail({
    from: '"contact" <contact@marsai.com>', // sender address, add YOUR NAME & YOUR MAIL
    to, // list of receivers
    subject, // Subject line
    html,
  });
  return info.response;
}


## Modifier 
"contact" 
## avec le nom de l'expéditeur ainsi que
<contact@marsai.com> 
## avec son adresse email.