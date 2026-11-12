from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np, json, base64, io, random
S=1000
def sh(c,f): return tuple(max(0,min(255,int(v*f))) for v in c)
def layer(): return Image.new('RGBA',(S,S),(0,0,0,0))
def blur(im,r): return im.filter(ImageFilter.GaussianBlur(r))
def comp(base,top): return Image.alpha_composite(base,top)
def grad_bg(c1,c2):
    a=np.zeros((S,S,3),dtype=np.float32)
    for i in range(3): a[:,:,i]=np.linspace(c1[i],c2[i],S)[:,None]
    im=Image.fromarray(a.astype(np.uint8)).convert('RGBA')
    bk=layer(); d=ImageDraw.Draw(bk)
    d.ellipse((120,140,620,640),fill=(255,255,255,60)); d.ellipse((560,60,900,400),fill=(255,255,255,40))
    return comp(im,blur(bk,60))
def avatar(skin,hair,hc,top,bg,beard=None,glasses=False,hijab=None,blazer=None,lip=None,lash=True,collar=(250,250,250),female=False):
    cx=500
    im=grad_bg(bg,sh(bg,0.9))
    skin_d=sh(skin,0.84); skin_l=sh(skin,1.06)
    lip=lip or (sh(skin,0.66) if not female else sh((200,100,110),1.0))
    L=layer(); d=ImageDraw.Draw(L)
    # hair behind
    if hair in('long','wavy'):
        d.ellipse((cx-215,250,cx+215,760),fill=hc+(255,)); d.rectangle((cx-215,500,cx+215,900),fill=hc+(255,))
    if hair=='bob':
        d.ellipse((cx-200,260,cx+200,660),fill=hc+(255,)); d.rectangle((cx-200,450,cx+200,640),fill=hc+(255,))
    if hair=='bun': d.ellipse((cx-75,150,cx+75,290),fill=hc+(255,))
    if hijab: d.ellipse((cx-235,225,cx+235,800),fill=hijab+(255,))
    # shoulders
    body=blazer or top
    d.ellipse((cx-420,800,cx+420,1500),fill=body+(255,))
    if blazer:
        d.polygon([(cx-80,800),(cx+80,800),(cx,980)],fill=top+(255,))
        d.polygon([(cx-80,800),(cx-190,800),(cx-20,990)],fill=sh(blazer,1.15)+(255,)); d.polygon([(cx+80,800),(cx+190,800),(cx+20,990)],fill=sh(blazer,1.15)+(255,))
    else:
        d.polygon([(cx-115,800),(cx+115,800),(cx,925)],fill=collar+(255,)) if not hijab else None
    if hijab:
        d.polygon([(cx-190,700),(cx+190,700),(cx+330,1000),(cx-330,1000)],fill=hijab+(255,))
    # neck
    d.rectangle((cx-68,640,cx+68,830),fill=skin_d+(255,))
    if not hijab: d.polygon([(cx-68,820),(cx+68,820),(cx,930)],fill=skin_d+(255,))
    im=comp(im,L)
    # neck shadow under chin
    N=layer(); nd=ImageDraw.Draw(N); nd.ellipse((cx-120,610,cx+120,720),fill=(0,0,0,70)); im=comp(im,blur(N,18))
    L=layer(); d=ImageDraw.Draw(L)
    # ears
    if not hijab:
        for sx in(-1,1): d.ellipse((cx+sx*152-26,470,cx+sx*152+26,560),fill=skin_d+(255,))
    # head
    d.ellipse((cx-158,300,cx+158,690),fill=skin+(255,))
    im=comp(im,L)
    # face shading: light from top-left
    SH=layer(); sd=ImageDraw.Draw(SH)
    sd.ellipse((cx-40,330,cx+190,690),fill=sh(skin,0.80)+(70,))
    im=comp(im,blur(SH,40))
    HL=layer(); hd=ImageDraw.Draw(HL); hd.ellipse((cx-120,380,cx-20,470),fill=(255,255,255,40)); im=comp(im,blur(HL,28))
    L=layer(); d=ImageDraw.Draw(L)
    # hijab frame over head
    if hijab:
        d.ellipse((cx-165,255,cx+165,420),fill=hijab+(255,))
        d.pieslice((cx-165,270,cx+165,760),200,340,fill=hijab+(255,))
        d.ellipse((cx-135,330,cx+135,680),fill=skin+(255,))
        im=comp(im,L); L=layer(); d=ImageDraw.Draw(L)
        d.arc((cx-150,300,cx+150,640),205,335,fill=sh(hijab,0.8)+(255,),width=26)
    # hair top
    def cap(h):
        d.pieslice((cx-176,240,cx+176,560),180,360,fill=hc+(255,))
        d.polygon([(cx-176,400),(cx-136,400),(cx-146,330)],fill=hc+(255,)); d.polygon([(cx+176,400),(cx+136,400),(cx+146,330)],fill=hc+(255,))
    if hair in('short','long','bun','bob','wavy'): cap(hair)
    if hair=='short':
        d.pieslice((cx-176,248,cx+176,470),180,360,fill=hc+(255,))
    if hair=='sidepart':
        d.pieslice((cx-176,240,cx+176,540),180,360,fill=hc+(255,)); d.pieslice((cx-30,340,cx+176,470),200,340,fill=skin+(255,)); d.polygon([(cx-176,420),(cx-130,420),(cx-150,340)],fill=hc+(255,))
    if hair=='fade':
        d.pieslice((cx-166,262,cx+166,520),188,352,fill=sh(hc,1.0)+(255,))
    if hair=='curly':
        for k in range(-6,7):
            x=cx+k*27; y=292-abs(k)*7+(0 if abs(k)<6 else 50)
            d.ellipse((x-40,y-40,x+40,y+40),fill=hc+(255,))
        d.pieslice((cx-160,262,cx+160,520),195,345,fill=hc+(255,))
    if hair=='long' or hair=='wavy' or hair=='bob':
        d.pieslice((cx-90,300,cx+120,440),195,345,fill=skin+(255,)) if hair!='bob' else None
        d.pieslice((cx-176,240,cx+176,500),195,345,fill=hc+(255,))
    im=comp(im,L)
    # hair highlight
    if not hijab and hair!='bald':
        H=layer(); hd=ImageDraw.Draw(H); hd.arc((cx-150,262,cx+150,480),215,300,fill=(255,255,255,70),width=18); im=comp(im,blur(H,6))
    L=layer(); d=ImageDraw.Draw(L)
    # eyes
    ey=470
    for sx in(-1,1):
        x=cx+sx*62
        d.ellipse((x-27,ey-17,x+27,ey+17),fill=(250,250,250,255))
        d.ellipse((x-14,ey-14,x+14,ey+14),fill=(70,48,38,255) if skin[0]>150 else (44,30,26,255))
        d.ellipse((x-6,ey-6,x+6,ey+6),fill=(15,12,12,255)); d.ellipse((x-9,ey-10,x-3,ey-4),fill=(255,255,255,230))
        d.arc((x-30,ey-26,x+30,ey+8),195,345,fill=(30,22,20,255),width=6)
        eb=sh(hc if hc!=(0,0,0) else (30,30,30),0.85) if hair!='bald' or beard else (40,30,28)
        d.arc((x-36,ey-58,x+36,ey-18),205,335,fill=eb+(255,),width=9)
    # nose
    d.arc((cx-26,500,cx+26,566),40,140,fill=sh(skin,0.72)+(255,),width=5)
    # blush
    B=layer(); bd=ImageDraw.Draw(B)
    if female: 
        for sx in(-1,1): bd.ellipse((cx+sx*88-36,520,cx+sx*88+36,570),fill=(230,120,120,60))
    im=comp(im,blur(B,18))
    # mouth
    mx=cx
    if beard:
        d.chord((cx-162,330,cx+162,730),24,156,fill=beard+(255,))
        d.ellipse((cx-44,548,cx+44,578),fill=beard+(255,))
        d.ellipse((cx-34,584,cx+34,612),fill=(205,125,120,255)); d.ellipse((cx-34,584,cx+34,598),fill=(250,240,238,255))
    else:
        d.ellipse((cx-48,590,cx+48,626),fill=lip+(255,))
        d.chord((cx-52,578,cx+52,640),10,170,fill=lip+(255,))
        d.arc((cx-44,584,cx+44,626),20,160,fill=sh(lip,0.7)+(255,),width=3)
        # slight teeth line
        d.ellipse((cx-30,598,cx+30,610),fill=(250,246,244,255))
    if glasses:
        for sx in(-1,1): d.ellipse((cx+sx*62-46,ey-38,cx+sx*62+46,ey+42),outline=(36,36,42,255),width=7)
        d.line((cx-16,ey-4,cx+16,ey-4),fill=(36,36,42,255),width=7)
    im=comp(im,L)
    # soft vignette + grain
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    yy,xx=np.mgrid[0:S,0:S]; v=1-0.18*(((xx-500)**2+(yy-520)**2)/(700**2)); a*=v[...,None]
    a+=np.random.default_rng(3).normal(0,2.4,a.shape)
    out=Image.fromarray(np.clip(a,0,255).astype(np.uint8)).resize((480,480),Image.LANCZOS)
    return out
SK={'p':(246,214,190),'l':(240,200,170),'m':(222,170,130),'t':(198,142,102),'b':(160,108,76),'d':(110,72,50),'o':(214,168,124)}
AV=[
 dict(skin=SK['l'],hair='long',hc=(98,64,42),top=(232,236,242),bg=(205,218,234),blazer=(34,48,86),female=True),
 dict(skin=SK['m'],hair='short',hc=(46,34,28),top=(240,240,244),bg=(224,218,208),blazer=(36,42,58),beard=(52,38,32)),
 dict(skin=SK['p'],hair='bun',hc=(212,170,100),top=(150,66,78),bg=(238,222,224),female=True),
 dict(skin=SK['t'],hair='short',hc=(22,18,20),top=(58,112,112),bg=(210,232,228),glasses=True),
 dict(skin=SK['o'],hair='bald',hc=(0,0,0),top=(236,232,222),bg=(238,226,208),hijab=(66,82,118),female=True),
 dict(skin=SK['d'],hair='curly',hc=(22,18,18),top=(244,244,246),bg=(222,222,232),blazer=(52,52,62),beard=(24,20,20)),
 dict(skin=SK['t'],hair='wavy',hc=(30,22,22),top=(212,160,52),bg=(244,224,206),female=True),
 dict(skin=SK['l'],hair='sidepart',hc=(26,24,28),top=(246,246,248),bg=(214,224,238),blazer=(86,92,104),glasses=True),
 dict(skin=SK['b'],hair='long',hc=(20,16,18),top=(44,128,112),bg=(214,234,222),female=True),
 dict(skin=SK['o'],hair='short',hc=(30,24,22),top=(150,186,222),bg=(236,230,214),beard=(40,32,28)),
 dict(skin=SK['p'],hair='bob',hc=(150,70,40),top=(66,112,84),bg=(218,226,234),glasses=True,female=True),
 dict(skin=SK['d'],hair='fade',hc=(18,16,16),top=(250,250,250),bg=(236,226,214),blazer=(30,40,80)),
]
out=[]
for i,a in enumerate(AV):
    im=avatar(**a); im.save(f'/home/claude/tpl/av2/a{i}.jpg',quality=90)
    b=io.BytesIO(); im.resize((400,400),Image.LANCZOS).save(b,'JPEG',quality=84); out.append('data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode())
json.dump(out,open('/home/claude/tpl/av2/avatars.json','w'))
sheet=Image.new('RGB',(6*250,2*250),'#333')
for i in range(12): sheet.paste(Image.open(f'/home/claude/tpl/av2/a{i}.jpg').resize((246,246)),((i%6)*250+2,(i//6)*250+2))
sheet.save('/home/claude/tpl/av2/sheet.png'); print([len(x)//1024 for x in out])
