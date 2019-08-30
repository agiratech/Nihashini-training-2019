import { Directive,ElementRef, Renderer2, OnInit } from "@angular/core";

@Directive({
    selector:'[appHighlight]'
})
export class Highlight implements OnInit {
    constructor(private elementRef: ElementRef, private renderer: Renderer2){ }
    ngOnInit(){
        
        this.elementRef.nativeElement.style.backgroundColor = 'green';    
    }
}