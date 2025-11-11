#!/bin/bash
# ssl-setup.sh

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificates
sudo certbot --nginx -d leledumbo.com -d www.leledumbo.com
sudo certbot --nginx -d rumanabastala.com -d www.rumanabastala.com

# Setup auto-renewal
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -