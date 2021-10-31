import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
// import { UAParser } from 'ua-parser-js';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }


  options: FormGroup;
  theme = "dark";
  isWindows10 = false;
  ngOnInit(): void {
    // const parser = new UAParser();
    // this.isWindows10 = parser.getOS().name.toLowerCase().includes('windows');
  }

  scrollToElement(element):void{
    console.log(element);
    //todo
  }

}
