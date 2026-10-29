import os, codecs, re, sys
from urllib.parse import urljoin, urlparse
try:
    import requests
except Exception:
    requests=None

root=os.getcwd()
outdir=os.path.join(root,'assets','img','portfolio')
os.makedirs(outdir,exist_ok=True)
# sources from extractor
sources={
    'shop.png':'https://shop.bittonik.com/og-image.jpg',
    'bwt.png':'https://bwt.bittonik.com/images/bwt.png',
    'shop_logo_bittonik.png':'https://bittonik.com/static/images/logo-social.jpg'
}
# try to get universeschoolus og image
try:
    u='https://universeschoolus.org'
    if requests:
        r=requests.get(u,timeout=10)
        txt=r.text
    else:
        import urllib.request
        txt=urllib.request.urlopen(u, timeout=10).read().decode('utf-8',errors='ignore')
    m=re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',txt, re.I)
    if m:
        img_url=m.group(1)
        if img_url.startswith('/'):
            img_url=urljoin(u, img_url)
        sources['universeschoolus.png']=img_url
    else:
        # fallback to first img
        m2=re.search(r'<img[^>]+src=["\']([^"\']+)["\']',txt)
        if m2:
            img_url=m2.group(1)
            if img_url.startswith('/'):
                img_url=urljoin(u,img_url)
            sources['universeschoolus.png']=img_url
except Exception as e:
    print('Could not fetch universeschoolus:', e)

print('Will download:', sources)

for name,url in sources.items():
    try:
        if requests:
            r=requests.get(url, timeout=15)
            if r.status_code==200:
                data=r.content
            else:
                print('Failed',url,'status',r.status_code)
                continue
        else:
            import urllib.request
            data=urllib.request.urlopen(url, timeout=15).read()
        path=os.path.join(outdir,name)
        with open(path,'wb') as fh:
            fh.write(data)
        print('Saved',path)
    except Exception as e:
        print('Error downloading',url, e)

print('Done')
