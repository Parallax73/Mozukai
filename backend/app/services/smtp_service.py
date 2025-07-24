import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import aiosmtplib
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  

async def send_welcome_email(user_email: str) -> bool:
    logger.info("Preparing welcome email for: %s", user_email)
    try:
        subject = "Sejá bem-vindo a nossa plataforma!"
        plain_text = f"""
Olá!

Sua conta foi criada com sucessso {user_email}

Agradecemos o registro!!

Mozukai
        """.strip()

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">Welcome!</h2>
                    <p>Olá</p>
                    <p>Sua conta foi criada com sucessso <strong>{user_email}</strong></p>
                    <p>Agradecemos o registro!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br>Mozukai</p>
                </div>
            </body>
        </html>
        """

        result = await _send_email_async(
            to_emails=[user_email],
            subject=subject,
            plain_text=plain_text,
            html_content=html_content
        )

        if result:
            logger.info("Welcome email sent to: %s", user_email)
        else:
            logger.warning("Failed to send welcome email to: %s", user_email)

        return result
    except Exception as e:
        logger.exception("Exception while sending welcome email to %s: %s", user_email, e)
        return False

async def _send_email_async(
    to_emails: List[str],
    subject: str,
    plain_text: str,
    html_content: Optional[str] = None
) -> bool:
    if not settings.smtp_username or not settings.smtp_paswword:
        logger.warning("SMTP credentials not configured")
        return False

    try:
        logger.info("Sending async email to: %s", to_emails)
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_username
        message["To"] = ", ".join(to_emails)

        text_part = MIMEText(plain_text, "plain")
        message.attach(text_part)

        if html_content:
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

        await aiosmtplib.send(
            message,
            hostname=settings.smtp_server,
            port=settings.smtp_port,
            start_tls=True,
            username=settings.smtp_username,
            password=settings.smtp_paswword,
        )

        logger.info("Email sent successfully to %s", to_emails)
        return True
    except Exception as e:
        logger.exception("Error sending async email to %s: %s", to_emails, e)
        return False

def send_email_sync(
    to_emails: List[str],
    subject: str,
    plain_text: str,
    html_content: Optional[str] = None
) -> bool:
    if not settings.smtp_username or not settings.smtp_paswword:
        logger.warning("SMTP credentials not configured")
        return False

    try:
        logger.info("Sending sync email to: %s", to_emails)
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_username
        message["To"] = ", ".join(to_emails)

        text_part = MIMEText(plain_text, "plain")
        message.attach(text_part)

        if html_content:
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

        context = ssl.create_default_context()
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls(context=context)
            server.login(settings.smtp_username, settings.smtp_paswword)
            server.sendmail(settings.smtp_username, to_emails, message.as_string())

        logger.info("Email sent successfully to %s", to_emails)
        return True
    except Exception as e:
        logger.exception("Error sending sync email to %s: %s", to_emails, e)
        return False
