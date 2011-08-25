from xml.dom import minidom
from xml.parsers.expat import ExpatError
import urllib, os, sys
files = []
if ('-debug' in sys.argv) or ('-verbose' in sys.argv) or ('-errors' in sys.argv) or ('-v' in sys.argv): warnings = sys.stderr
else: warnings = open('/dev/null', 'w')
if '-config' in sys.argv: config = sys.argv[sys.argv.find('-config')+1]
elif '-c' in sys.argv: config = sys.argv[sys.argv.find('-c')+1]
else: config = '/Users/bobby/Preferences/Adium/adium.updater.cfg'
if ('-help' in sys.argv) or ('--help' in sys.argv) or ('-h' in sys.argv) or ('-?' in sys.argv):
	print '''
Usage: python "adium updater.py" [-vh] [-c file]

	-v, -verbose:		Print out errors and warnings.
	-c, -config file:	Use "file" as a config file. Otherwise, uses "adium updater.cfg".
	-h, -help:		Display this screen.
'''
	sys.exit(0)
for line in open(config).readlines():
	line = os.path.expanduser(line[:-1])
	if not os.path.isdir(line): continue
	for f in os.listdir(line):
		files += [os.path.join(os.path.expanduser(line), f)]
total = 0
for f in files:
	ext = os.path.splitext(f)[1].lower()
	if ext in ('.listlayout', '.listtheme'):
		try: doc = minidom.parse(f)
		except: doc = minidom.parse(f+'/Contents/Info.plist')
		else: continue
		cat = 4
	elif ext == '.adiumemoticonset':
		doc = minidom.parse(f+'/Emoticons.plist')
		cat = 2
	elif ext == '.adiummenubaricons':
		try: doc = minidom.parse(f+'/Contents/Info.plist')
		except: doc = minidom.parse(f+'/Info.plist')
		else: continue
		cat = 11
	elif ext == '.adiummessagestyle':
		try: doc = minidom.parse(f+'/Contents/Info.plist')
		except: doc = minidom.parse(f+'/Info.plist')
		else: continue
		cat = 5
	elif ext == '.adiumplugin':
		try: doc = minidom.parse(f+'/Contents/Info.plist')
		except: doc = minidom.parse(f+'/Info.plist')
		else: continue
		cat = 9
	elif ext == '.adiumscripts':
		try: doc = minidom.parse(f+'/Contents/Info.plist')
		except: doc = minidom.parse(f+'/Info.plist')
		else: continue
		cat = 6
	elif ext == '.adiumsoundset':
		doc = minidom.parse(f+'/Sounds.plist')
		cat = 3
	elif ext == '.adiumstatusicons':
		doc = minidom.parse(f+'/Icons.plist')
		cat = 7
	elif ext == '.adiumserviceicons':
		doc = minidom.parse(f+'/Icons.plist')
		cat = 10
	else: continue
	key = ''
	installed = ''
	name = os.path.splitext(os.path.split(f)[1])[0]
	for node in doc.getElementsByTagName('dict')[0].childNodes:
		if node.nodeType == node.TEXT_NODE: continue
		elif node.nodeName == u'key': key = node.childNodes[0].data
		elif node.nodeName == u'string':
			if key in (u'CFBundleInfoDictionaryVersion', u'XtraBundleVersion'): installed = node.childNodes[0].data
			elif key == u'CFBundleName':
				name = node.childNodes[0].data
		elif node.nodeName in (u'integer', u'real'):
			if (key == u'AdiumSetVersion') and (installed == ''): installed = node.childNodes[0].data+'.0'
	url = "http://www.adiumxtras.com/index.php?a=cats&cat_id=%i&s=%s" % (cat, urllib.quote_plus(name))
	doc.unlink()
	if installed == '': continue

	try:
		doc = minidom.parseString(urllib.urlopen(url).read().decode('iso-8859-1').encode('ascii', 'xmlcharrefreplace').replace('& ', ' ').replace('<B>', '<b>'))
		url = "http://www.adiumxtras.com/"+doc.childNodes[1]\
			.childNodes[3]\
			.childNodes[1]\
			.childNodes[11]\
			.getElementsByTagName('table')[1]\
			.getElementsByTagName('tr')[1]\
			.getElementsByTagName('td')[1]\
			.getElementsByTagName('a')[0]\
			.attributes['href'].value
		doc.unlink()
	except ExpatError, e:
		warnings.write("Can't parse "+url+'\n')
		continue
	except IndexError, e:
		warnings.write("Can't find "+name+'\n')
		continue

	try:
		doc = minidom.parseString(urllib.urlopen(url).read().decode('iso-8859-1').encode('ascii', 'xmlcharrefreplace').replace('&', '').replace('<B>', '<b>'))
		current = doc.childNodes[1]\
			.childNodes[3]\
			.childNodes[1]\
			.childNodes[11]\
			.getElementsByTagName('table')[1]\
			.getElementsByTagName('tr')[0]\
			.getElementsByTagName('td')[1]\
			.getElementsByTagName('div')[0]\
			.getElementsByTagName('table')[0]\
			.getElementsByTagName('tr')[0]\
			.getElementsByTagName('td')[1]\
			.childNodes[0].data
	except ExpatError, e:
		warnings.write("Can't parse "+url+'\n')
		continue
	except IndexError, e:
		warnings.write("Can't parse "+name+'\n')
		continue

	doc.unlink()
	if current > installed:
		print "%s\n\tInstalled:\t%s\n\tCurrent:\t%s\n\tURL:\t\t%s\n" % (name, installed, current, url)
		total += 1

print total, 'new Xtras available.'
