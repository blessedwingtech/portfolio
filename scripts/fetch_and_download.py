import os, re
from urllib.parse import urljoin
try:
    import requests
except Exception:
    requests=None

sites={
    'shop':'https://shop.bittonik.com',
    'bittonik':'https://bittonik.com',
    'bwt':'https://bwt.bittonik.com',
    'universeschoolus':'https://universeschoolus.org'
}
outdir=os.path.join(os.getcwd(),'assets','img','portfolio')
os.makedirs(outdir,exist_ok=True)

for name,base in sites.items():
    print('\nSITE',name,base)
    try:
        if requests:
            r=requests.get(base, timeout=10)
            txt=r.text
        else:
            import urllib.request
            txt=urllib.request.urlopen(base, timeout=10).read().decode('utf-8',errors='ignore')
        cands=[]
        m=re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',txt, re.I)
        if m: cands.append(m.group(1))
        m2=re.search(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',txt, re.I)
        if m2: cands.append(m2.group(1))
        imgs=re.findall(r'<img[^>]+src=["\']([^"\']+)["\']',txt)
        for im in imgs[:5]: cands.append(im)
        # normalize
        newc=[]
        for u in cands:
            if u.startswith('//'):
                u='https:'+u
            if u.startswith('/'):
                u=urljoin(base,u)
            if u.startswith('http'):
                newc.append(u)
        tried=False
        for url in newc:
            try:
                print('Trying',url)
                if requests:
                    rr=requests.get(url, timeout=10)
                    if rr.status_code==200 and 'image' in rr.headers.get('Content-Type',''):
                        ext=url.split('.')[-1].split('?')[0]
                        fname=f"{name}.{ext}"
                        with open(os.path.join(outdir,fname),'wb') as fh:
                            fh.write(rr.content)
                        print('Saved',fname)
                        tried=True
                        break
                    else:
                        print('Not image or status',rr.status_code, rr.headers.get('Content-Type'))
                else:
                    import urllib.request
                    data=urllib.request.urlopen(url, timeout=10).read()
                    with open(os.path.join(outdir,name+'.png'),'wb') as fh:
                        fh.write(data)
                    tried=True
                    break
            except Exception as e:
                print('fail',url,e)
        if not tried:
            print('No suitable image found for',name)
    except Exception as e:
        print('Error fetching',base,e)
print('\nDone')
