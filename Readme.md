Local Weather Information

Directory Structure 
. 
+-- arduino_sensor: Restful Server build in django 
| +-- account: account related code
| +-- demo: node related code
+-- client: website and andriod app build in cordova 
+-- www: user document website 
+-- arduino_code: code for arduino

installation: 
required packages 
sudo apt-get install apache2 
sudo apt-get install python3-pip 
sudo apt-get install apache2-threaded-dev 
sudo apt-get install python-dev

wget https://github.com/GrahamDumpleton/mod_wsgi/archive/4.4.10.tar.gz 
tar -xvf 4.4.10.tar.gz 
cd mod_wsgi-4.4.10/ 
./configure 
sudo make install

sudo apt-get install libapache2-mod-wsgi-py3 
sudo pip3 install django 
sudo pip3 install python-social-auth 
sudo pip3 install djangorestframework 
sudo pip3 install django-cors-headers
