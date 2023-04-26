import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Note} from 'src/app/shared/note.model';
import {NotesService} from 'src/app/shared/notes.service';
import {trigger, transition, style, animate, stagger, query} from '@angular/animations';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      transition('void => *', [
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingRight: '*',
          paddingLeft: '*',
        })),
        animate(100),
      ]),

      transition('* => void', [
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75,
        })),
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        animate('150ms ease-out', style({
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': '0',
        }))
      ])
    ]),

    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0,
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>;

  constructor(private notesService: NotesService) {
  }

  ngOnInit(): void {
    this.notes = this.notesService.getAll();
    this.filter('');
  }

  generateNoteURL(note: Note) {
    let noteID = this.notesService.getID(note);
    return noteID;
  }

  deleteNote(note: Note) {
    let noteID = this.notesService.getID(note);
    this.notesService.delete(noteID);

    this.filter(this.filterInputElRef.nativeElement.value);
  }

  filter(query: string) {
    query = query.toLowerCase().trim();

    let allResults: Note[] = new Array<Note>();

    let terms: string[] = query.split(' ');

    terms = this.removeDuplicates(terms);

    terms.forEach(term => {
      let results: Note[] = this.relaventNotes(term);


      allResults = [...allResults, ...results];
    });

    let uniqueResults = this.removeDuplicates(allResults);

    this.filteredNotes = uniqueResults;


    this.sortByRelavency(allResults);
  }

  relaventNotes(query: string): Array<Note> {
    query = query.toLowerCase().trim();

    let relaventNotes = this.notes.filter(note => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }

      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    })

    return relaventNotes;
  }

  sortByRelavency(searchResults: Note[]) {
    let noteCountObj: { [index: number]: any } = {};


    searchResults.forEach(note => {
      let noteID = this.notesService.getID(note);

      if (noteCountObj[noteID]) {
        noteCountObj[noteID] += 1;
      } else {
        noteCountObj[noteID] = 1;
      }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      let aID = this.notesService.getID(a);
      let bID = this.notesService.getID(b);

      let aCount = noteCountObj[aID];
      let bCount = noteCountObj[bID];

      return bCount - aCount;
    })
  }

  removeDuplicates(arr: Array<any>): Array<any> {
    let uniqueResults: Set<any> = new Set<any>();

    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }

}
