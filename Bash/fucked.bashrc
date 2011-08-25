# System-wide .bashrc file for interactive bash(1) shells.
if [ -z "$PS1" ]; then
   return
fi

PS1='\h:\W \u\$ '
# Make bash check its window size after a process completes
shopt -s checkwinsize

alias ls='ls -alG'
alias php='/usr/local/zend/bin/php'
alias zf=zf.sh


#   Custom Settings

export EDITOR=/usr/bin/vim
export HISTFILESIZE=10000 # the bash history should save 3000 commands
export HISTCONTROL=ignoredups #don't put duplicate lines in the history.
alias hist='history | grep $1' #Requires one input

# Define a few Color's
BLACK='\e[0;30m'
BLUE='\e[0;34m'
GREEN='\e[0;32m'
CYAN='\e[0;36m'
RED='\e[0;31m'
PURPLE='\e[0;35m'
BROWN='\e[0;33m'
LIGHTGRAY='\e[0;37m'
DARKGRAY='\e[1;30m'
LIGHTBLUE='\e[1;34m'
LIGHTGREEN='\e[1;32m'
LIGHTCYAN='\e[1;36m'
LIGHTRED='\e[1;31m'
LIGHTPURPLE='\e[1;35m'
YELLOW='\e[1;33m'
WHITE='\e[1;37m'
NC='\e[0m'              # No Color


# Source global definitions
if [ -f /etc/bashrc ]; then
    . /etc/bashrc
fi

# enable programmable completion features
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi


# Alias's to modified commands
alias ps='ps auxf'
alias home='cd ~'
alias pg='ps aux | grep'  #requires an argument
alias un='tar -zxvf'
alias mountedinfo='df -hT'
alias ping='ping -c 10'
alias openports='netstat -nape --inet'
alias ns='netstat -alnp --protocol=inet | grep -v CLOSE_WAIT | cut
-c-6,21-94 | tail +2'
alias du1='du -h --max-depth=1'
alias da='date "+%Y-%m-%d %A    %T %Z"'
alias ebrc='vim ~/.bashrc'

# Alias to multiple ls commands
alias la='ls -Al'                   # show hidden files
alias ls='ls -aF --color=always'    # add colors and file type extensions
alias lx='ls -lXB'                  # sort by extension
alias lk='ls -lSr'                  # sort by size
alias lc='ls -lcr'                  # sort by change time
alias lu='ls -lur'                  # sort by access time
alias lr='ls -lR'                   # recursive ls
alias lt='ls -ltr'                  # sort by date
alias lm='ls -al |more'             # pipe through 'more'

# Alias chmod commands
alias mx='chmod a+x'
alias 000='chmod 000'
alias 644='chmod 644'
alias 755='chmod 755'


# Alias xterm and aterm
alias term='xterm -bg AntiqueWhite -fg Black &'
alias termb='xterm -bg AntiqueWhite -fg NavyBlue &'
alias termg='xterm -bg AntiqueWhite -fg OliveDrab &'
alias termr='xterm -bg AntiqueWhite -fg DarkRed &'
alias aterm='aterm -ls -fg gray -bg black'
alias xtop='xterm -fn 6x13 -bg LightSlateGray -fg black -e top &'
alias xsu='xterm -fn 7x14 -bg DarkOrange4 -fg white -e su &'

alias tl='tail -f /usr/local/zend/var/log/'
# alias te='tail -f /var/log/apache/error.log'


# SPECIAL FUNCTIONS
#######################################################

netinfo ()
{
echo "--------------- Network Information ---------------"
/sbin/ifconfig | awk /'inet addr/ {print $2}'
echo ""
/sbin/ifconfig | awk /'Bcast/ {print $3}'
echo ""
/sbin/ifconfig | awk /'inet addr/ {print $4}'

# /sbin/ifconfig | awk /'HWaddr/ {print $4,$5}'
echo "---------------------------------------------------"
}

spin ()
{
echo -ne "${RED}-"
echo -ne "${WHITE}\b|"
echo -ne "${BLUE}\bx"
sleep .02
echo -ne "${RED}\b+${NC}"
}

scpsend ()
{
scp -P PORTNUMBERHERE "$@"
USERNAME@YOURWEBSITE.com:/var/www/html/pathtodirectoryonremoteserver/;
}


# NOTES
#######################################################

# To temporarily bypass an alias, we preceed the command with a \
# EG:  the ls command is aliased, but to use the normal ls command you would
# type \ls

# mount -o loop /home/crouse/NAMEOFISO.iso /home/crouse/ISOMOUNTDIR/
# umount /home/crouse/NAMEOFISO.iso
# Both commands done as root only.


# WELCOME SCREEN
#######################################################

clear
for i in `seq 1 15` ; do spin; done ;echo -ne "${WHITE} USA Linux Users
Group ${NC}"; for i in `seq 1 15` ; do spin; done ;echo "";
echo -e ${LIGHTBLUE}`cat /etc/SUSE-release` ;
echo -e "Kernel Information: " `uname -smr`;
echo -e ${LIGHTBLUE}`bash --version`;echo ""
echo -ne "Hello $USER today is "; date
echo -e "${WHITE}"; cal ; echo "";
echo -ne "${CYAN}";netinfo;
mountedinfo ; echo ""
echo -ne "${LIGHTBLUE}Uptime for this computer is ";uptime | awk /'up/
{print $3,$4}'
for i in `seq 1 15` ; do spin; done ;echo -ne "${WHITE} http://usalug.org
${NC}"; for i in `seq 1 15` ; do spin; done ;echo "";
echo ""; echo ""
# The following belong under the "function" section in my .bashrc. Useable as seperate programs, I've integrated them simply as functions for my .bashrc file in order to make them quick to use and easy to modify and find. These are functions that are used to symetrically encrypt and to decrypt files and messages. Some are completely command line, and the last two create gui interfaces to locate the files to encrypt/decrypt. If you create a program out of the functions creating a link via a shortcut/icon on the desktop would create a completely gui based interface to locate and encrypt/decrypt files. Either way, it's an easy way to use gpg.


