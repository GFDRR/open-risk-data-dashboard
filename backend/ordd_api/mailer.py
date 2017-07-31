# Do these imports at the top of the module.
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from email.mime.image import MIMEImage
from ordd.settings import ORDD_ADMIN_MAIL
from django.template import TemplateDoesNotExist


def mailer(address, subject, content_txt, content_html, template):
    # You probably want all the following code in a function or method.
    # You also need to set subject, sender and to_mail yourself.
    html_content = render_to_string('ordd_api/mail_templates/%s.html'
                                    % template, content_html)
    try:
        text_content = render_to_string('ordd_api/mail_templates/%s.txt'
                                        % template, content_txt)
    except TemplateDoesNotExist:
        text_content = html_content

    msg = EmailMultiAlternatives(subject, html_content,
                                 ORDD_ADMIN_MAIL, [address])

    msg.content_subtype = "html"
    msg.attach_alternative(text_content, "text/plain")

    msg.mixed_subtype = 'related'

    for f in ['img1.png', 'img2.png']:
        fp = open(os.path.join(os.path.dirname(__file__), 'templates',
                               'ordd_api', 'mail_templates', f), 'rb')
        msg_img = MIMEImage(fp.read())
        fp.close()
        msg_img.add_header('Content-ID', '<{}>'.format(f))
        msg.attach(msg_img)

    msg.send()
