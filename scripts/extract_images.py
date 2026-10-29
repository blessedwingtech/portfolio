import os, codecs, re
files=['bittonik_home.html','shop_bittonik_home.html','bwt_bittonik_home.html']
root=os.getcwd()
results={}
for f in files:
    path=os.path.join(root,f)
    found=None
    for enc in ['utf-8','utf-8-sig','utf-16','latin-1']:
        try:
            with codecs.open(path,'r',enc) as fh:
                txt=fh.read()
            # search og:image
            m=re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',txt, re.I)
            if m:
                found=m.group(1)
            else:
                m2=re.search(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',txt, re.I)
                if m2:
                    found=m2.group(1)
                else:
                    imgs=re.findall(r'<img[^>]+src=["\']([^"\']+)["\']',txt)
                    if imgs:
                        found=imgs[0]
            results[f]={'enc':enc,'img':found}
            break
        except Exception as e:
            continue
for k,v in results.items():
    print(k, v)
