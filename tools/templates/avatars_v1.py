from PIL import Image, ImageDraw, ImageFilter
import math, base64, io, json
S=800
def shade(c,f): return tuple(max(0,min(255,int(v*f))) for v in c)
def avatar(skin,hair,hairc,shirt,bg,beard=False,glasses=False,collar=(250,250,250),hijab=None,blazer=None,lip=(170,90,90)):
    im=Image.new('RGB',(S,S),bg); d=ImageDraw.Draw(im)
    # soft backdrop circle
    d.ellipse((120,90,680,650),fill=shade(bg,0.96))
    cx=400
    skin_d=shade(skin,0.88)
    # long hair / scarf behind
    if hair=='long':
        d.ellipse((cx-170,230,cx+170,640),fill=hairc); d.rectangle((cx-170,420,cx+170,700),fill=hairc)
    if hair=='bun':
        d.ellipse((cx-60,150,cx+60,260),fill=hairc)
    if hijab:
        d.ellipse((cx-185,215,cx+185,640),fill=hijab)
    # shoulders / shirt
    d.ellipse((cx-330,640,cx+330,1180),fill=blazer or shirt)
    if blazer:
        d.polygon([(cx-60,640),(cx+60,640),(cx,780)],fill=shirt)
    # neck
    d.rectangle((cx-52,520,cx+52,665),fill=skin_d)
    d.polygon([(cx-90,650),(cx+90,650),(cx,745)],fill=collar if not blazer else shirt) if not hijab else None
    d.polygon([(cx-52,650),(cx+52,650),(cx,720)],fill=skin_d)
    if hijab:
        d.polygon([(cx-150,560),(cx+150,560),(cx+260,800),(cx-260,800)],fill=hijab)
        d.ellipse((cx-60,560,cx+60,640),fill=skin_d)
    # ears
    if not hijab:
        d.ellipse((cx-148,385,cx-108,445),fill=skin_d); d.ellipse((cx+108,385,cx+148,445),fill=skin_d)
    # head
    d.ellipse((cx-122,255,cx+122,540),fill=skin)
    if hijab:
        d.ellipse((cx-125,235,cx+125,330),fill=hijab)
        d.arc((cx-118,250,cx+118,500),200,340,fill=hijab,width=34)
    # hair
    if hair in ('short','long','bun'):
        d.pieslice((cx-136,225,cx+136,470),180,360,fill=hairc)
        d.polygon([(cx-136,350),(cx-110,350),(cx-118,300)],fill=hairc); d.polygon([(cx+136,350),(cx+110,350),(cx+118,300)],fill=hairc)
        if hair=='short':
            d.pieslice((cx-100,255,cx+60,380),180,350,fill=skin)  # forehead cut
            d.pieslice((cx-136,225,cx+136,420),188,352,fill=hairc)
    if hair=='curly':
        for k in range(-5,6):
            x=cx+k*24; y=262-abs(k)*6+ (0 if abs(k)<5 else 40)
            d.ellipse((x-34,y-34,x+34,y+34),fill=hairc)
        d.pieslice((cx-124,240,cx+124,430),195,345,fill=hairc)
    if hair=='bald':
        pass
    # face features
    ey=400
    for sx in (-48,48):
        d.ellipse((cx+sx-13,ey-9,cx+sx+13,ey+13),fill=(40,32,30))
        d.arc((cx+sx-28,ey-38,cx+sx+28,ey-8),200,340,fill=shade(hairc if hairc!=(0,0,0) else (30,30,30),0.9),width=6)
    d.arc((cx-24,420,cx+24,468),60,120,fill=shade(skin,0.78),width=4)
    # beard
    if beard:
        d.chord((cx-126,262,cx+126,566),24,156,fill=hairc)
        d.ellipse((cx-38,447,cx+38,470),fill=hairc)
        d.arc((cx-30,462,cx+30,494),25,155,fill=(226,176,170),width=6)
    else:
        d.arc((cx-52,448,cx+52,505),25,155,fill=lip,width=8)
    if glasses:
        for sx in (-48,48): d.ellipse((cx+sx-34,ey-30,cx+sx+34,ey+36),outline=(35,35,40),width=6)
        d.line((cx-14,ey-2,cx+14,ey-2),fill=(35,35,40),width=6)
    im=im.resize((400,400),Image.LANCZOS)
    return im
SK={'a':(244,205,178),'b':(224,172,132),'c':(186,125,88),'d':(120,78,52),'e':(235,190,160)}
AV=[
 avatar(SK['a'],'long',(96,62,40),(54,92,150),(222,232,242),blazer=(40,52,78),collar=(250,250,250)),            # Emily
 avatar(SK['b'],'short',(58,40,30),(235,238,242),(226,222,214),beard=True,blazer=(38,44,60)),                      # Daniel
 avatar(SK['a'],'bun',(214,176,104),(150,70,80),(236,226,226),collar=(250,250,250)),                               # Lena
 avatar(SK['c'],'short',(24,20,22),(70,110,110),(218,232,230),glasses=True,collar=(250,250,250)),                  # Rohan
 avatar(SK['b'],'bald',(0,0,0),(240,240,240),(240,230,218),hijab=(70,86,120)),                  # Amira (headscarf)
 avatar(SK['d'],'curly',(22,18,18),(60,60,70),(226,226,232),beard=True,blazer=(50,50,60)),      # Marcus
]
AV[4]=avatar(SK['b'],'bald',(0,0,0),(230,200,150),(240,230,218),hijab=(70,86,120))
out=[]
for i,a in enumerate(AV):
    a.save(f'/home/claude/tpl/avatars/a{i}.jpg',quality=88)
    b=io.BytesIO(); a.save(b,'JPEG',quality=84); out.append('data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode())
json.dump(out,open('/home/claude/tpl/avatars/avatars.json','w'))
sheet=Image.new('RGB',(6*410,410),'#444')
for i,a in enumerate(AV): sheet.paste(a,(i*410+5,5))
sheet.save('/home/claude/tpl/avatars/sheet.png'); print([len(x)//1024 for x in out])
