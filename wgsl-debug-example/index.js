const ie=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerpolicy&&(n.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?n.credentials="include":s.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}};ie();const o=class{constructor(e,t){this.shader_active=()=>`@group(${this.bindgroup_num}) @binding(0) var<storage,read_write> _dbg: array<u32>;

var<private> _dbg_unit: u32;

fn dbg_init(uid: u32) {
	/* initialize debug unit for this uid */
	_dbg_unit = ${o.BUF_HEADER_SIZE}u + uid*${this.buf_unit_size()}u;
	_dbg[_dbg_unit] = 0u; // entries count
}

fn dbg_32m(mark: i32, val: u32, vtype: i32) {
	/* limit entries count, but still store the total number of calls */
	var entry_count = _dbg[_dbg_unit];
	_dbg[_dbg_unit] = entry_count + 1u;
	if (entry_count == ${this.buf_unit_entries_count}u) {
		return;
	}

	/* store data in a new debug unit entry */
	var entry_off = _dbg_unit + 1u + entry_count * ${o.BUF_ENTRY_SIZE}u;
	_dbg[entry_off] = u32(vtype);
	_dbg[entry_off + 1u] = val;
	_dbg[entry_off + 2u] = u32(mark);
}

fn dbg_u32m(mark: i32, val: u32) { dbg_32m(mark, val, ${o.BUF_ENTRY_TYPE_U32}); }
fn dbg_i32m(mark: i32, val: i32) { dbg_32m(mark, bitcast<u32>(val), ${o.BUF_ENTRY_TYPE_I32}); }
fn dbg_f32m(mark: i32, val: f32) { dbg_32m(mark, bitcast<u32>(val), ${o.BUF_ENTRY_TYPE_F32}); }
fn dbg_32(val: u32, vtype: i32) { dbg_32m(${o.BUF_ENTRY_MARK_UNSET}, val, vtype); }
fn dbg_u32(val: u32) { dbg_u32m(${o.BUF_ENTRY_MARK_UNSET}, val); }
fn dbg_i32(val: i32) { dbg_i32m(${o.BUF_ENTRY_MARK_UNSET}, val); }
fn dbg_f32(val: f32) { dbg_f32m(${o.BUF_ENTRY_MARK_UNSET}, val); }`,this.buf_unit_size=()=>o.BUF_UNIT_HEADER_SIZE+this.buf_unit_entries_count*o.BUF_ENTRY_SIZE,this.buf_unit_size_bytes=()=>Uint32Array.BYTES_PER_ELEMENT*this.buf_unit_size(),this.bindgroup_num=e,this.buf_unit_entries_count=t===void 0?o.BUF_UNIT_ENTRIES_COUNT_DEFAULT:t,this.record=new Array,this.pass_n=0}set_output(e){e.attach(this),this.output=e}add_shader(e,t){t&&e.search(/^[ \t]*dbg_init/m)<0&&alert("your shader does not contain any dbg_init() call, debug will not work properly");var i=t?this.shader_active():o.SHADER_INACTIVE;this.marks=new Array;const a=e.matchAll(/^[ \t]*dbg_[uif]?32m[ \t]*\([ \t]*(?<value>[0-9]+)[^;]*;[ \t]*(\/\/|\/\*)(?<comment>.*)/mg);for(const s of a){const n=Number(s.groups.value),r=s.groups.comment.trim();this.marks[n]=r}return console.log(`WGSL_debug add_shader ${JSON.stringify(this.marks)}`),i+`
`+e}setup(e,t){console.log("WGSL_debug setup"),this.device=e,this.unit_count=t,this.buf_size=o.BUF_HEADER_SIZE_BYTES+t*this.buf_unit_size_bytes(),console.log(`WGSL_debug unit_count=${t} buf_size=${this.buf_size}`),this.buf&&this.buf.destroy(),this.buf=e.createBuffer({size:this.buf_size,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.dstbuf&&this.dstbuf.destroy(),this.dstbuf=e.createBuffer({size:this.buf_size,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.record=new Array,this.pass_n=0,this.output?this.output.reset():console.log(`WGSL_debug output format: <debug_header>
<global_invoke_id> <debug_call_n> [<record_count>] <pass_last-${this.buf_unit_entries_count}...last>`)}create_bindgroup(e){this.bindgroup=this.device.createBindGroup({layout:e.getBindGroupLayout(this.bindgroup_num),entries:[{binding:0,resource:{buffer:this.buf}}]})}set_bindgroup(e){e.setBindGroup(this.bindgroup_num,this.bindgroup)}fetch(e){e.copyBufferToBuffer(this.buf,0,this.dstbuf,0,this.buf_size)}async process(e){await this.dstbuf.mapAsync(GPUMapMode.READ);const t=this.dstbuf.getMappedRange(),i=new Uint32Array(t),a=new Int32Array(t),s=new Float32Array(t);var n;this.hang_detect("reset"),n=Array.from(Array(this.unit_count),()=>new Array);for(var r=0;r<this.unit_count&&!this.hang_detect("process");r+=1){const h=o.BUF_HEADER_SIZE+r*this.buf_unit_size(),l=i[h];if(l>0){l>this.buf_unit_entries_count&&console.warn(`WGSL debug: ${l} debug calls where made from unit_id=${r}, but only the first ${this.buf_unit_entries_count} where recorded
Consider increasing buf_unit_entries_count.`);for(var d=0;d<Math.min(l,this.buf_unit_entries_count);d++){const f=h+o.BUF_UNIT_HEADER_SIZE+d*o.BUF_ENTRY_SIZE,u=i[f];var c=-1;u==o.BUF_ENTRY_TYPE_U32?c=i[f+1]:u==o.BUF_ENTRY_TYPE_I32?c=a[f+1]:u==o.BUF_ENTRY_TYPE_F32&&(c=s[f+1]);var S=i[f+2];n[r].push({value:c,type:u,mark:S})}}}this.record.push(n);var T=!0;if(this.output&&(T=!1,this.output.update()),e&&(T=e(this.pass_n,n,this.record)),T){console.log(`WGSL_debug ${i.slice(0,o.BUF_HEADER_SIZE).toString()}`);var U="";n.forEach((h,l)=>{U+=`${l} [${h.length}] ${h}
`}),console.log(U)}this.dstbuf.unmap(),this.pass_n++}clear_processed(){this.record.forEach(e=>{e.forEach(t=>{t.forEach(i=>{i.processed=!1})})})}hang_detect(e,t){if(e!=this.hang_detect_op)this.hang_detect_op=e,this.hang_detect_start=Date.now(),this.hang_detect_counter=0,this.hang_detect_resolution=t||o.HANG_DETECT_RESOLUTION;else if(this.hang_detect_counter++,this.hang_detect_counter%this.hang_detect_resolution==0&&Date.now()-this.hang_detect_start>o.HANG_DETECT_LIMIT)return console.warn(`WGSL_debug hang detected in '${e}' after ${this.hang_detect_counter} iterations (${o.HANG_DETECT_LIMIT}ms), interrupting operation`),this.hang_detect_op=null,!0;return!1}};let E=o;E.BUF_HEADER_SIZE=16;E.BUF_HEADER_SIZE_BYTES=Uint32Array.BYTES_PER_ELEMENT*o.BUF_HEADER_SIZE;E.BUF_UNIT_HEADER_SIZE=1;E.BUF_UNIT_ENTRIES_COUNT_DEFAULT=20;E.BUF_ENTRY_SIZE=3;E.BUF_ENTRY_TYPE_U32=1;E.BUF_ENTRY_TYPE_I32=2;E.BUF_ENTRY_TYPE_F32=3;E.BUF_ENTRY_MARK_UNSET=999999;E.HANG_DETECT_LIMIT=500;E.HANG_DETECT_RESOLUTION=100;E.SHADER_INACTIVE=`fn dbg_init(unit_id: u32) {}

fn dbg_u32(val: u32) {}
fn dbg_i32(val: i32) {}
fn dbg_f32(val: f32) {}
fn dbg_32(val: u32, vtype: u32) {}

fn dbg_u32m(mark: i32, val: u32) {}
fn dbg_i32m(mark: i32, val: i32) {}
fn dbg_f32m(mark: i32, val: f32) {}
fn dbg_32m(mark: i32, val: f32, vtype: i32) {}`;const _=class{constructor(e,t){this.shader_active=()=>`@group(${this.bindgroup_num}) @binding(0) var<storage,read_write> _dbg: array<u32>;

var<private> _dbg_unit: u32;

fn dbg_init(uid: u32) {
	/* initialize debug unit for this uid */
	_dbg_unit = ${_.BUF_HEADER_SIZE}u + uid*${this.buf_unit_size()}u;
	_dbg[_dbg_unit] = 0u; // entries count
}

fn dbg_32m(mark: i32, val: u32, vtype: i32) {
	/* limit entries count, but still store the total number of calls */
	var entry_count = _dbg[_dbg_unit];
	_dbg[_dbg_unit] = entry_count + 1u;
	if (entry_count == ${this.buf_unit_entries_count}u) {
		return;
	}

	/* store data in a new debug unit entry */
	var entry_off = _dbg_unit + 1u + entry_count * ${_.BUF_ENTRY_SIZE}u;
	_dbg[entry_off] = u32(vtype);
	_dbg[entry_off + 1u] = val;
	_dbg[entry_off + 2u] = u32(mark);
}

fn dbg_u32m(mark: i32, val: u32) { dbg_32m(mark, val, ${_.BUF_ENTRY_TYPE_U32}); }
fn dbg_i32m(mark: i32, val: i32) { dbg_32m(mark, bitcast<u32>(val), ${_.BUF_ENTRY_TYPE_I32}); }
fn dbg_f32m(mark: i32, val: f32) { dbg_32m(mark, bitcast<u32>(val), ${_.BUF_ENTRY_TYPE_F32}); }
fn dbg_32(val: u32, vtype: i32) { dbg_32m(${_.BUF_ENTRY_MARK_UNSET}, val, vtype); }
fn dbg_u32(val: u32) { dbg_u32m(${_.BUF_ENTRY_MARK_UNSET}, val); }
fn dbg_i32(val: i32) { dbg_i32m(${_.BUF_ENTRY_MARK_UNSET}, val); }
fn dbg_f32(val: f32) { dbg_f32m(${_.BUF_ENTRY_MARK_UNSET}, val); }`,this.buf_unit_size=()=>_.BUF_UNIT_HEADER_SIZE+this.buf_unit_entries_count*_.BUF_ENTRY_SIZE,this.buf_unit_size_bytes=()=>Uint32Array.BYTES_PER_ELEMENT*this.buf_unit_size(),this.bindgroup_num=e,this.buf_unit_entries_count=t===void 0?_.BUF_UNIT_ENTRIES_COUNT_DEFAULT:t,this.record=new Array,this.pass_n=0}set_output(e){e.attach(this),this.output=e}add_shader(e,t){t&&e.search(/^[ \t]*dbg_init/m)<0&&alert("your shader does not contain any dbg_init() call, debug will not work properly");var i=t?this.shader_active():_.SHADER_INACTIVE;this.marks=new Array;const a=e.matchAll(/^[ \t]*dbg_[uif]?32m[ \t]*\([ \t]*(?<value>[0-9]+)[^;]*;[ \t]*(\/\/|\/\*)(?<comment>.*)/mg);for(const s of a){const n=Number(s.groups.value),r=s.groups.comment.trim();this.marks[n]=r}return console.log(`WGSL_debug add_shader ${JSON.stringify(this.marks)}`),i+`
`+e}setup(e,t){console.log("WGSL_debug setup"),this.device=e,this.unit_count=t,this.buf_size=_.BUF_HEADER_SIZE_BYTES+t*this.buf_unit_size_bytes(),console.log(`WGSL_debug unit_count=${t} buf_size=${this.buf_size}`),this.buf&&this.buf.destroy(),this.buf=e.createBuffer({size:this.buf_size,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.dstbuf&&this.dstbuf.destroy(),this.dstbuf=e.createBuffer({size:this.buf_size,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.record=new Array,this.pass_n=0,this.output?this.output.reset():console.log(`WGSL_debug output format: <debug_header>
<global_invoke_id> <debug_call_n> [<record_count>] <pass_last-${this.buf_unit_entries_count}...last>`)}create_bindgroup(e){this.bindgroup=this.device.createBindGroup({layout:e.getBindGroupLayout(this.bindgroup_num),entries:[{binding:0,resource:{buffer:this.buf}}]})}set_bindgroup(e){e.setBindGroup(this.bindgroup_num,this.bindgroup)}fetch(e){e.copyBufferToBuffer(this.buf,0,this.dstbuf,0,this.buf_size)}async process(e){await this.dstbuf.mapAsync(GPUMapMode.READ);const t=this.dstbuf.getMappedRange(),i=new Uint32Array(t),a=new Int32Array(t),s=new Float32Array(t);var n;this.hang_detect("reset"),n=Array.from(Array(this.unit_count),()=>new Array);for(var r=0;r<this.unit_count&&!this.hang_detect("process");r+=1){const h=_.BUF_HEADER_SIZE+r*this.buf_unit_size(),l=i[h];if(l>0){l>this.buf_unit_entries_count&&console.warn(`WGSL debug: ${l} debug calls where made from unit_id=${r}, but only the first ${this.buf_unit_entries_count} where recorded
Consider increasing buf_unit_entries_count.`);for(var d=0;d<Math.min(l,this.buf_unit_entries_count);d++){const f=h+_.BUF_UNIT_HEADER_SIZE+d*_.BUF_ENTRY_SIZE,u=i[f];var c=-1;u==_.BUF_ENTRY_TYPE_U32?c=i[f+1]:u==_.BUF_ENTRY_TYPE_I32?c=a[f+1]:u==_.BUF_ENTRY_TYPE_F32&&(c=s[f+1]);var S=i[f+2];n[r].push({value:c,type:u,mark:S})}}}this.record.push(n);var T=!0;if(this.output&&(T=!1,this.output.update()),e&&(T=e(this.pass_n,n,this.record)),T){console.log(`WGSL_debug ${i.slice(0,_.BUF_HEADER_SIZE).toString()}`);var U="";n.forEach((h,l)=>{U+=`${l} [${h.length}] ${h}
`}),console.log(U)}this.dstbuf.unmap(),this.pass_n++}clear_processed(){this.record.forEach(e=>{e.forEach(t=>{t.forEach(i=>{i.processed=!1})})})}hang_detect(e,t){if(e!=this.hang_detect_op)this.hang_detect_op=e,this.hang_detect_start=Date.now(),this.hang_detect_counter=0,this.hang_detect_resolution=t||_.HANG_DETECT_RESOLUTION;else if(this.hang_detect_counter++,this.hang_detect_counter%this.hang_detect_resolution==0&&Date.now()-this.hang_detect_start>_.HANG_DETECT_LIMIT)return console.warn(`WGSL_debug hang detected in '${e}' after ${this.hang_detect_counter} iterations (${_.HANG_DETECT_LIMIT}ms), interrupting operation`),this.hang_detect_op=null,!0;return!1}};let v=_;v.BUF_HEADER_SIZE=16;v.BUF_HEADER_SIZE_BYTES=Uint32Array.BYTES_PER_ELEMENT*_.BUF_HEADER_SIZE;v.BUF_UNIT_HEADER_SIZE=1;v.BUF_UNIT_ENTRIES_COUNT_DEFAULT=20;v.BUF_ENTRY_SIZE=3;v.BUF_ENTRY_TYPE_U32=1;v.BUF_ENTRY_TYPE_I32=2;v.BUF_ENTRY_TYPE_F32=3;v.BUF_ENTRY_MARK_UNSET=999999;v.HANG_DETECT_LIMIT=500;v.HANG_DETECT_RESOLUTION=100;v.SHADER_INACTIVE=`fn dbg_init(unit_id: u32) {}

fn dbg_u32(val: u32) {}
fn dbg_i32(val: i32) {}
fn dbg_f32(val: f32) {}
fn dbg_32(val: u32, vtype: u32) {}

fn dbg_u32m(mark: i32, val: u32) {}
fn dbg_i32m(mark: i32, val: i32) {}
fn dbg_f32m(mark: i32, val: f32) {}
fn dbg_32m(mark: i32, val: f32, vtype: i32) {}`;class se{constructor(){}attach(t){console.log("WGSL_debug output attach"),this.debug=t}}const k=class extends se{constructor(e){super();this.conf={selected_pass:0,pass_range:0,live:!1,dirty:!1};const t=e+"-scroll",i=e+"-table",a=e+"-timeline",s=e+"-timelineval",n=e+"-passcount",r=e+"-timelinelive",d=e+"-passrange",c=document.getElementById(e);if(!c){console.warn(`WGSL_debug: could not find debug output element id : '${e}`);return}c.innerHTML=`
<div class="debug-output-controls">
	pass&nbsp;&nbsp;
	<input type="number" min="1" max="0" value="0" step="1" id="${s}"/> &#xb1;
	<input type="number" min="0" max="60" value="0" step="1" id="${d}"/> /
	<span id="${n}"></span>
	<input type="range" min="1" max="0" value="0" step="1" id="${a}" class="debug-output-timeline"/>
	<label><input type="checkbox" checked=1 id="${r}" />live</label>
</div>
<div id="${t}" class="debug-output-table">
	<table id="${i}">
	</table>
<div>
`,this.scroll=document.getElementById(t),this.table=document.getElementById(i),this.timeline=document.getElementById(a),this.timelineval=document.getElementById(s),this.passcount=document.getElementById(n),this.timelinelive=document.getElementById(r),this.passrange=document.getElementById(d);const S=u=>{this.update()},T=u=>{this.conf.selected_pass=Number(u.target.value),this.conf.live=!1,this.update()},U=u=>{this.conf.selected_pass=Number(u.target.value),this.conf.live=!1,this.update()},h=u=>{this.conf.live=u.target.checked,this.update()},l=u=>{this.conf.pass_range=Number(u.target.value),this.row_height=0,this.debug.clear_processed(),this.reset(),this.update()};this.scroll.addEventListener("scroll",S),this.timeline.addEventListener("input",T),this.timelineval.addEventListener("input",U),this.timelinelive.addEventListener("click",h),this.passrange.addEventListener("input",l);var f=document.createElement("style");f.innerHTML=`
#${s} { width: 5em; }
#${d} { width: 3em; }
`,document.head.appendChild(f),this.row_height=0,this.reset()}reset(){!this.table||(this.col=new Array,this.processed=new Array,this.conf.selected_pass=0,this.conf.live=!0,this._reset_table(),this.update())}_reset_table(){this.table.innerHTML="";var e=this.table.createTHead(),t=document.createElement("th");t.innerText="uid",e.appendChild(t)}update(){if(!this.table||!this.debug)return;for(;this.processed.length<this.debug.record.length;)this.processed.push(!1);if(window.getComputedStyle(this.table).visibility=="hidden")return;const e=Date.now();if(this.update_timeout||this.last_update&&e-this.last_update<k.MIN_UPDATE_INTERVAL){this.update_timeout||(this.update_timeout=setTimeout(()=>{this.update_timeout=null,this.last_update=null,this.update()},k.MIN_UPDATE_INTERVAL));return}this.debug.hang_detect("reset"),this.last_update=e;const t=this.conf,i=this.debug,a=this.table.tHead;t.live==!0&&(t.selected_pass=i.pass_n),this.timelineval.max=i.pass_n.toString(),this.timelineval.value=t.selected_pass.toString(),this.passcount.innerText=i.pass_n.toString(),this.timeline.max=i.pass_n.toString(),this.timeline.value=t.selected_pass.toString(),this.timelinelive.checked=t.live;const s=i.record[t.selected_pass-1];if(!s){console.log(`table update no pass selected_pass=${t.selected_pass} pass_n=${i.pass_n} recordlen=${i.record.length}`);return}if(this.table.rows.length<s.length){console.log(`table update create_rows ${this.table.rows.length} to ${s.length}`),this.table.tBodies.length==0&&this.table.createTBody();const m=Array(1+t.pass_range*2).fill("0").join("<br/>");console.log(`table update create_rows celltext_empty=${m}`);for(var n="",r=this.table.rows.length;r<s.length;r++)n+="<tr><th>"+r.toString()+"</th><td>"+m+`</td></tr>
`;this.table.tBodies[0].innerHTML+=n,console.log("table update create_rows trigger"),this.table.rows[0].cells[1].innerHTML=m,console.log("table update create_rows done")}if(!this.row_height){console.log("table update get first cell");const m=this.table.rows[0].cells[1];console.log("table update get first cell style");const g=window.getComputedStyle(m);console.log("table update calculate row_height"),this.row_height=Number(g.height.replace("px",""))+Number(g.paddingTop.replace("px",""))+Number(g.paddingBottom.replace("px","")),console.log(`WGSL_debug_table setting row_height=${this.row_height}`)}const d=this.scroll.scrollTop,c=[d,d+this.scroll.clientHeight],S=[Math.floor(c[0]/this.row_height),Math.min(Math.ceil(c[1]/this.row_height)+1,s.length)];this.processed[this.conf.selected_pass-1]||(s.every(m=>{if(this.debug.hang_detect("table update process_pass"))return!1;var g=0;return m.forEach(b=>{if(!b.processed){var B=b.value.toString().length+k.COL_WIDTH_ADJUST;this.conf.pass_range>0&&(B+=2);for(var y=g;;y++){if(y==this.col.length){var w=document.createElement("th");b.mark!=v.BUF_ENTRY_MARK_UNSET?i.marks[b.mark]?w.innerText=i.marks[b.mark]:w.innerText=b.mark.toString():w.innerText="d"+g.toString(),a.insertBefore(w,a.children[g].nextSibling);const Y={maxlen:B,mark:b.mark,dirty_maxlen:!0,width:0};this.col.splice(g,0,Y);break}if(this.col[y].mark==b.mark){g=y;break}}B>this.col[g].maxlen&&(this.col[g].maxlen=B,this.col[g].dirty_maxlen=!0),g++,b.processed=!0}}),!0}),this.processed[this.conf.selected_pass-1]=!0);const T=[this.scroll.scrollLeft,this.scroll.scrollLeft+this.scroll.clientWidth];var U=0,h=[0,this.col.length];this.col.every((m,g)=>{if(this.debug.hang_detect("table update header columns",1))return!1;if(U<T[0]&&(h[0]=g),m.dirty_maxlen){const b=a.children[g+1],B=`min-width: ${m.maxlen}ex;`;b.setAttribute("style",B);const y=window.getComputedStyle(b);m.width=Number(y.width.replace("px",""))}return U+=m.width,U<T[1]&&(h[1]=g+1),!0});for(var l=S[0];l<S[1]&&!this.debug.hang_detect("table update content");l++){const m=s[l],g=this.table.rows[l];for(var f=0,u=h[0];u<h[1];u++){const b=m[u];if(!b)continue;for(;b.mark!=this.col[f].mark;)if(f++,f==this.col.length){console.warn(`WGSL_debug update html table content: did not find column mark for entry at uid=${l} entry_n=${u}`);return}for(;!g.cells[f+1];)g.insertCell(-1);const B=g.cells[f+1];var I="";if(t.pass_range==0)I=b.value.toString();else{const y=Math.max(t.pass_range,Math.min(t.selected_pass-1,i.record.length-1-t.pass_range)),w=y-t.pass_range,Y=y+t.pass_range;for(var F=w;F<=Y;F++){if(F==t.selected_pass-1)I+="*"+b.value+"*";else{const O=i.record[F];I+=O&&u<O[l].length?O[l][u].value:"-"}F<Y&&(I+=`
`)}}B.innerText=I,f++}}}};let W=k;W.COL_WIDTH_ADJUST=3;W.MIN_UPDATE_INTERVAL=100;const A=1e3*1e3,ne=1+1,J=ne*Uint32Array.BYTES_PER_ELEMENT,re=A*2,ae=re*Float32Array.BYTES_PER_ELEMENT,oe=256,K=5,V=0,_e=1,ue=3e3,de=4,X=`struct uniform_t {
	values_count: u32;
	time: f32;
};

@group(0) @binding(0) var<uniform> uniforms: uniform_t;
@group(0) @binding(1) var<storage,read_write> c_values: array<vec2<f32>>;
@stage(compute) @workgroup_size(#WORKGROUP_SIZE)
fn compute(@builtin(local_invocation_id) lid: vec3<u32>,
	   @builtin(workgroup_id) wid: vec3<u32>,
	   @builtin(num_workgroups) numw: vec3<u32>) {
	var i = wid.x * #WORKGROUP_SIZEu + lid.x;
	for (; i < uniforms.values_count; i = i + #WORKGROUP_SIZEu * numw.x) {
		dbg_init(i);
		var v = c_values[i];
		dbg_f32m(0, v.x);		    // x
		dbg_f32m(1, v.y);		    // y
		dbg_f32m(2, uniforms.time);	    // time
		v = v * (1.0 + sin(uniforms.time / 1000.0) * 0.1);
		c_values[i] = v;
	}
}

@group(0) @binding(0) var<storage,read> v_values: array<vec2<f32>>;
@stage(vertex)
fn vertex(@builtin(vertex_index) vidx: u32) -> @builtin(position) vec4<f32> {
        var v = v_values[vidx];
        return vec4(v, 0.0, 1.0);
}

@stage(fragment)
fn fragment() -> @location(0) vec4<f32> {
        return vec4(1.0, 0.0, 0.0, 1.0);
}`.replace(/#WORKGROUP_SIZE/g,oe.toString());var p,j,x,Q,H,R,q,$,Z,P,C,G,L=0,ee=!0,N=!0,D,z=2e3;async function le(){const e=navigator.gpu;e||M("your browser does not seem to support WebGPU");var t=await e.requestAdapter();t||M("request for GPU adapter failed"),p=await t.requestDevice();var i=document.getElementById("canvas");$=i.getContext("webgpu"),$||M("could not get WebGPU context");const a=window.devicePixelRatio||1,s=[i.clientWidth,i.clientHeight],n=[s[0]*a,s[1]*a];C=$.getPreferredFormat(t),$.configure({device:p,format:C,size:n}),document.getElementById("shader_src").innerHTML=X.replace(/dbg/g,"<mark>dbg</mark>"),D=document.getElementById("stats"),Z=p.createBuffer({size:J,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),P=p.createBuffer({size:ae,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX,mappedAtCreation:!0});const r=new Float32Array(P.getMappedRange()),d=2*Math.PI/A;for(var c=0;c<A;c++)r[c*2+0]=.5*Math.cos(c*d),r[c*2+1]=.5*Math.sin(c*d);P.unmap(),R=new E(_e,de),q=new W("debug-div"),R.set_output(q),G=!0,window.requestAnimationFrame(te)}async function ce(){console.log(`setup debug_active=${N}`);const e=R.add_shader(X,N),t=p.createShaderModule({code:e}),i=await t.compilationInfo();i.messages.length>0&&M(`shader compilation has failed:
`+i.messages.map(a=>`${a.lineNum}:${a.linePos} [${a.type}] ${a.message}`)),x=p.createComputePipeline({compute:{module:t,entryPoint:"compute"}}),H=p.createRenderPipeline({vertex:{module:t,entryPoint:"vertex"},fragment:{module:t,entryPoint:"fragment",targets:[{format:C}]},primitive:{topology:"point-list"}}),j=p.createBindGroup({layout:x.getBindGroupLayout(V),entries:[{binding:0,resource:{buffer:Z}},{binding:1,resource:{buffer:P}}]}),Q=p.createBindGroup({layout:H.getBindGroupLayout(V),entries:[{binding:0,resource:{buffer:P}}]}),N&&(R.setup(p,z),R.create_bindgroup(x)),G=!1}async function te(){G&&await ce(),(L==0||L%20==0)&&(D.innerText=`Points count: ${A}
Dispatch count: ${K}
Compute pass: ${L}`);const e=p.createCommandEncoder(),t=performance.now(),i=new ArrayBuffer(J);if(new Uint32Array(i,0,1).set([A]),new Float32Array(i,4,1).set([t]),p.queue.writeBuffer(Z,0,i),ee){const d=e.beginComputePass();d.setPipeline(x),d.setBindGroup(0,j),N&&R.set_bindgroup(d),d.dispatch(K),d.end(),L++}const s={colorAttachments:[{view:$.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]},n=e.beginRenderPass(s);n.setPipeline(H),n.setBindGroup(0,Q),n.draw(A,1,0,0),n.end(),N&&R.fetch(e);const r=e.finish();p.queue.submit([r]),N&&await R.process(),L<=ue?window.requestAnimationFrame(te):(D.innerText=D.innerText+`
PASS_MAX reached`,document.getElementById("compute_active").checked=!1)}function fe(e){ee=e.target.checked}function ge(e){N=e.target.checked,G=!0}function he(){document.getElementById("debug-div").classList.toggle("hidden")}function be(){const e=document.getElementById("debug_uidmax");z=Number(e.value),G=!0}function M(e){throw alert(e),new Error(e)}document.addEventListener("DOMContentLoaded",le);document.getElementById("compute_active").addEventListener("click",fe);document.getElementById("debug_active").addEventListener("click",ge);document.getElementById("debug_visible").addEventListener("click",he);document.getElementById("debug_uidmax_set").addEventListener("click",be);document.getElementById("debug_uidmax").value=z.toString();document.getElementById("debug_uidmax").max=A.toString();
//# sourceMappingURL=index.js.map
