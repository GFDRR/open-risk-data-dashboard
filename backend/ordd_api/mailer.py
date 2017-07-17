# Do these imports at the top of the module.
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from email.mime.image import MIMEImage
from ordd.settings import MAIL_SENDER


def mailer(address, subject, content_txt, content_html):
    # You probably want all the following code in a function or method.
    # You also need to set subject, sender and to_mail yourself.
    text_content = render_to_string('ordd_api/mail_templates/registration_confirm.txt', content_txt)
    html_content = render_to_string('ordd_api/mail_templates/registration_confirm.html', content_html)
    msg = EmailMultiAlternatives(subject, text_content,
                                 MAIL_SENDER, [address])

    msg.attach_alternative(html_content, "text/html")

    msg.mixed_subtype = 'related'

    for f in ['img1.png', 'img2.png']:
        fp = open(os.path.join(os.path.dirname(__file__), 'templates',
                               'ordd_api', 'mail_templates', f), 'rb')
        msg_img = MIMEImage(fp.read())
        fp.close()
        msg_img.add_header('Content-ID', '<{}>'.format(f))
        msg.attach(msg_img)

    msg.send()
