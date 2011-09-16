tell application "Finder"
	activate
	make new Finder window
	set target of Finder window 1 to disk "AWS Dev Server"
	set target of Finder window 1 to folder "var" of disk "AWS Dev Server"
	set target of Finder window 1 to folder "www" of folder "var" of disk "AWS Dev Server"
	set target of Finder window 1 to folder "vhosts" of folder "www" of folder "var" of disk "AWS Dev Server"
	set target of Finder window 1 to folder "as.symfony" of folder "vhosts" of folder "www" of folder "var" of disk "AWS Dev Server"
	set target of Finder window 1 to folder "src" of folder "as.symfony" of folder "vhosts" of folder "www" of folder "var" of disk "AWS Dev Server"
	set target of Finder window 1 to folder "ApartmentSmart" of folder "src" of folder "as.symfony" of folder "vhosts" of folder "www" of folder "var" of disk "AWS Dev Server"
end tell
