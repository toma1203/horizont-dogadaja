// GLSL shaderi za raytracing Schwarzschildove crne rupe (jedinice: Rs = 1).
// Fragment shader integrira putanju fotona: a = -1.5 * h² * r / |r|⁵,
// presijeca ekvatorijalnu ravninu (akrecijski disk) i uzorkuje nebo.

export const VERTEX_SHADER = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

export const FRAGMENT_SHADER = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uPos,uFwd,uRight,uUp;
uniform float uDisk,uDop,uBright,uOuter;
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
vec3 bb(float t){t=clamp(t,1000.,40000.)/100.;float r,g,b;
 if(t<=66.){r=1.;g=clamp(.39008*log(t)-.63184,0.,1.);}else{r=clamp(1.29294*pow(t-60.,-.1332),0.,1.);g=clamp(1.12989*pow(t-60.,-.0755),0.,1.);}
 if(t>=66.)b=1.;else if(t<=19.)b=0.;else b=clamp(.54321*log(t-10.)-1.19625,0.,1.);return vec3(r,g,b);}
vec3 sky(vec3 d){
 vec3 col=vec3(0.);
 vec3 n=normalize(vec3(.35,1.,.25));
 float band=exp(-pow(dot(d,n)*3.,2.));
 float neb=fbm(d*3.5+3.);
 col+=band*mix(vec3(.18,.14,.26),vec3(.42,.3,.22),fbm(d*6.))*pow(neb,2.2)*1.1;
 col+=vec3(.012,.016,.035)*fbm(d*2.+7.);
 for(int L=0;L<3;L++){
  float sc=55.+float(L)*85.;
  vec3 p=d*sc;vec3 c=floor(p);vec3 f=fract(p)-.5;
  float h=hash(c+float(L)*13.1);
  vec3 off=vec3(hash(c+1.7),hash(c+3.1),hash(c+5.3))-.5;
  float dist=length(f-off*.6);
  float th=.9-band*.08;
  float b=step(th,h)*(h-th)/(1.-th)*pow(max(0.,1.-dist/.11),5.);
  col+=b*bb(2800.+hash(c+9.)*9000.)*(1.6-float(L)*.4);
 }
 return col;}
vec4 disk(vec3 p,float rr,vec3 rd){
 float phi=atan(p.z,p.x);
 float om=pow(rr,-1.5);
 float ang=phi-uTime*om*2.2;
 float n=fbm(vec3(rr*3.2,cos(ang)*2.6,sin(ang)*2.6));
 float n2=noise(vec3(rr*9.,cos(ang)*7.,sin(ang)*7.));
 float f=pow(rr,-3.)*(1.-sqrt(3./rr));
 float tn=pow(max(f,0.),.25)/.2141;
 float v=sqrt(.5/(rr-1.));
 float gam=1./sqrt(1.-v*v);
 vec3 vd=normalize(vec3(-p.z,0.,p.x));
 float ct=dot(vd,-rd);
 float dop=1./(gam*(1.-v*ct));
 float g=mix(1.,dop*sqrt(1.-1./rr),uDop);
 float T=6200.*tn*g;
 float I=pow(tn,4.)*pow(g,4.);
 float dens=smoothstep(3.,3.25,rr)*smoothstep(uOuter,uOuter*.55,rr)*(.25+1.1*n*n+.35*n2);
 vec3 c=bb(T)*I*uBright*3.2*(.35+1.3*n);
 return vec4(c,clamp(dens*.95,0.,1.));}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 vec3 dir=normalize(uFwd*1.55+uRight*uv.x+uUp*uv.y);
 vec3 pos=uPos;
 vec3 hv=cross(pos,dir);float h2=dot(hv,hv);
 vec3 acc=vec3(0.);float tr=1.;float minR=1e3;bool hit=false;bool done=false;
 for(int i=0;i<280;i++){
  float r=length(pos);
  float dt=clamp(.045*r*r,.015,1.1);
  vec3 a=-1.5*h2*pos/pow(r,5.);
  vec3 nd=dir+a*dt;vec3 np=pos+nd*dt;
  if(uDisk>.5&&pos.y*np.y<0.){
   float t=pos.y/(pos.y-np.y);vec3 p=mix(pos,np,t);float rr=length(p.xz);
   if(rr>3.&&rr<uOuter){vec4 c=disk(p,rr,normalize(nd));acc+=tr*c.rgb*c.a;tr*=1.-c.a;}
  }
  pos=np;dir=nd;float nr=length(pos);minR=min(minR,nr);
  if(nr<1.){hit=true;break;}
  if(nr>90.){done=true;break;}
  if(tr<.01)break;
 }
 vec3 col=acc;
 if(!hit&&done)col+=tr*sky(normalize(dir));
 col+=vec3(1.,.72,.45)*.05*exp(-max(minR-1.5,0.)*4.)*uDisk*uBright*tr;
 col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
 vec2 q=gl_FragCoord.xy/uRes;col*=.55+.45*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.18);
 gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(.92)),1.);}`;
