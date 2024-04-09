import type { ITrigger } from "../chain/trigger";

export const triggers: ITrigger[] = [
  {
    type: "email_received",
    from: "kontakt@nocodemakers.pl",
    title:
      "🤔 Jak automatyzować codzienną pracę? Zapraszamy na bezpłatny webinar!",
    body: "Hello,\n\nYou have received a newsletter from NoCodeMakers.\n\nHowever, your email software can't display HTML emails. You can view the newsletter by clicking here:\n\nhttps://vyqvxm.clicks.mlsend.com/ty/c/eyJ2Ijoie1wiYVwiOjg3OTk2NyxcImxcIjoxMTgwMjE2NDEwNzU2ODg0NTMsXCJyXCI6MTE4MDIxNjQyNjcyNjY5ODU2fSIsInMiOiJmZmE0M2M2NmU0N2IxNWMzIn0\n\n\n\nYou're receiving this newsletter because you have shown interest in NoCodeMakers.\nNot interested anymore? Click here to unsubscribe:\nhttps://vyqvxm.clicks.mlsend.com/ty/c/eyJ2Ijoie1wiYVwiOjg3OTk2NyxcImxcIjoxMTgwMjE2NDEwNzE0OTQxNDgsXCJyXCI6MTE4MDIxNjQyNjcyNjY5ODU2fSIsInMiOiI4YzQ1ZDgyNGIyMGQxNjllIn0\n",
  },
  {
    type: "email_received",
    from: "noreply@tm.openai.com",
    title: "OpenAI API Invoice Payment Failed",
    body: "  OpenAI API Invoice Payment Failed      Please review your payment\nmethod to avoid service interruption \n                      Hi there,\n\n  We were unable to process your last payment for $59.02 using your\nmastercard ending in 9712. Your card has insufficient funds. \n\n  Please review your payment method, and update it if necessary to continue\nusing the API uninterrupted. \n\n           Review Payment Method\n<https://platform.openai.com/account/billing?with_org=org-u9fiAZJU2ZVEQntaWCC9hFGt>\n           We'll try to process your payment again in a few days. *If we\naren't able to complete your payment by *Apr 10, 2024 9:00 AM UTC*, your\norganization's API access will be suspended.* \n\n  If you have any questions, please contact us through our help center\n<https://help.openai.com/en/>, and we'll be happy to assist. \n\n  Best,\nThe OpenAI team \n\n                You received this email because you have a paid account\nwith OpenAI",
  },
  {
    type: "email_received",
    from: "Fly.io, Inc. <invoice+statements+acct_19BnkOGco2mvL6zT@stripe.com>",
    title: "Your receipt from Fly.io, Inc. #2455-9862",
    body: "Your receipt from Fly.io, Inc. #2455-9862  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏\n ͏  ͏ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­\n­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­\n­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­\n­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­\n\n\n<https://fly.io>   Fly.io, Inc.\n\n\n\n\nReceipt from Fly.io, Inc.\n$11.83\nPaid April 2, 2024\n\n\n  [image: invoice illustration]\nDownload invoice\n<https://58.email.stripe.com/CL0/https:%2F%2Fpay.stripe.com%2Finvoice%2Facct_19BnkOGco2mvL6zT%2Flive_YWNjdF8xOUJua09HY28ybXZMNnpULF9QcUV5cVVzV3Y0VFhYUDVSd0owY1BXMUNodEIyZVo2LDEwMjYwMzUwMg0200Fl63roMI%2Fpdf%3Fs=em/1/0100018e9ee3cfe1-11a40d1f-821b-4baa-99b4-804ec7613992-000000/Wn6E3e1pI74WcUXNZwBOjtZGwdzeWkySSXRmrM5qOy4=346>\nDownload receipt\n<https://58.email.stripe.com/CL0/https:%2F%2Fdashboard.stripe.com%2Freceipts%2Finvoices%2FCAcQARoXChVhY2N0XzE5Qm5rT0djbzJtdkw2elQo7YGwsAYyBvx6FZ4S1DovFh-9Vqs-RCAIPvLmVM2nZWTxfb_lr7NhBSM29Ed80B7TO_8L8RxbMb-whpLrr5c%2Fpdf%3Fs=em/1/0100018e9ee3cfe1-11a40d1f-821b-4baa-99b4-804ec7613992-000000/i1x8FB_POUFZcapev-cMIKA-6QFyC03es2ZsbpkfixE=346>\n\n\nReceipt number   2455-9862\n\nInvoice number   5A4F186A-0008\n\nPayment method   [image: Mastercard] - 9712\n\n\n\n\n  Receipt #2455-9862\n\n\n  Feb 29 – Mar 31, 2024\n\n\n\nSSL: Certificate (per certificate)\n\n\nQty 6\n\n\nFirst 10\n\n\nQty 6\n$0.00\n$0.00 each\n\n\nVolume: SSD Storage (per GB/hr)\n\n\nQty 4,408\n$0.92\n$0.0002083333 each\n\n\nVM: Additional RAM (per GB/s)\n\n\nQty 1,930,044\n$3.72\n$0.00000193 each\n\n\nOutbound Bandwidth: North America and Europe (per Byte)\n\n\nQty 8,661,766,374\n\n\nFirst 100000000000\n\n\nQty 8,661,766,374\n$0.00\n$0.00 each\n\n\nVM: Shared CPU (per second)\n\n\nQty 18,018,932\n\n\nFirst 8436960\n\n\nQty 8,436,960\n$0.00\n$0.00 each\n\n\n8436961 and above\n\n\nQty 9,581,972\n$7.19\n$0.00000075 each\n\n  Mar 31 – Apr 30, 2024\n\n\n\nHobby Plan\n\n\nQty 1\n$0.00\n\n\n\n\n\nTotal\n$11.83\n\n\n\n\n\nAmount paid\n$11.83\n\n\n\n\n  Questions? Visit our support site at https://fly.io/docs/, contact us at\nbilling@fly.io, or call us at +1 312-626-4490 <13126264490>.\n\n\n\n\nPowered by [image: stripe logo]\n<https://58.email.stripe.com/CL0/https:%2F%2Fstripe.com/1/0100018e9ee3cfe1-11a40d1f-821b-4baa-99b4-804ec7613992-000000/FV9dF9MnPANdbhP3TMRNrPxmE1Ek3zGQ0ScqNlTUm1w=346>\n |\nLearn more about Stripe Billing\n<https://58.email.stripe.com/CL0/https:%2F%2Fstripe.com%2Fbilling/1/0100018e9ee3cfe1-11a40d1f-821b-4baa-99b4-804ec7613992-000000/Qczbx0nMHWN6jUC-NPxCIISjm4nyvGRw2qe_6J390dE=346>\n",
  },
  {
    type: "email_received",
    from: "Elżbieta Warda <biurokdk@wp.pl>",
    title: "Faktura za usługi księgowe luty 2024",
    body: "Witam \n przesyłam fakturę MICHAŁ WARDA FUTURE BUILDER 2024/03/043\n Proszę o terminową zapłatę. \n Pozdrawiam \n Elżbieta Warda \n KDK Kancelaria Dobrego Księgowego sp z o.o. \n ul. Ogrodowa 65/5 \n 00-876 Warszawa \n NIP:527-267-91-32",
  },
];
