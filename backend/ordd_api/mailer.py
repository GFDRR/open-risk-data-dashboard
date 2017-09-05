# Do these imports at the top of the module.
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from email.mime.image import MIMEImage
from ordd.settings import ORDD_ADMIN_MAIL
from django.template import TemplateDoesNotExist


def mailer_attach_image(msg, filename, imgname):
    with open(filename, 'rb') as fp:
        msg_img = MIMEImage(fp.read())
        msg_img.add_header('Content-ID', '<{}>'.format(imgname))
        msg.attach(msg_img)


def mailer(address, subject, content_html, content_txt, template,
           from_addr=None):
    # You probably want all the following code in a function or method.
    # You also need to set subject, sender and to_mail yourself.
    html_content = render_to_string('ordd_api/mail_templates/%s.html'
                                    % template, content_html)
    if content_txt:
        try:
            text_content = render_to_string('ordd_api/mail_templates/%s.txt'
                                            % template, content_txt)
        except TemplateDoesNotExist:
            text_content = html_content

    if from_addr is None:
        from_addr = ORDD_ADMIN_MAIL
    msg = EmailMultiAlternatives(subject, html_content,
                                 from_addr, [address])
    msg.content_subtype = "html"

    if content_txt:
        msg.attach_alternative(text_content, "text/plain")

    msg.mixed_subtype = 'related'

    # This is the code needed to add images as part of a multi-part email

    for f in ['riskopendataindex.gif', 'world-bg.gif', 'gfdrr.gif']:
        mailer_attach_image(msg, os.path.join(
            os.path.dirname(__file__), 'templates',
            'ordd_api', 'mail_templates', 'img', f), f)

    msg.send()
