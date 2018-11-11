///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Create and configure synth object and sound output /////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

let synth = new Tone.Synth({
  oscillator:{
    type:'sine'
  },
  envelope : {
    attack:0.01,
    decay:0.7,
    sustain:.1,
    release:0.7
  }

});

const gain = new Tone.Gain(0.9);
gain.toMaster();
synth.connect(gain);

Tone.Transport.bpm.value = 90;
Tone.Transport.swing = 0.5;

///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Get Input From HTML Page Forms ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
$(".target" ).hide();

$('button#runBebop').click(function(event){
event.preventDefault();
let chordFromHtml =  $('input#bebopIn').val() ;
let keyFromHtml = $('input#keyIn').val();
let styleFromHtml = $('input[name=style]:checked').val();
let directionFromHtml = $('input[name=direction]:checked').val();
$('h1#output').html(BEBOPOBJ(chordFromHtml, keyFromHtml, styleFromHtml, directionFromHtml));
} );

////////////////////////////////////// Main Function ////////////////////////////////////////////// 
function BEBOPOBJ(CHORD, KEY, STYLE, DIRECTION) {

///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Define Constants and glbal functions ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
  const validRoots = 'abcdefg'; //use to check if root is valid
  const oct = 12; //number of half steps in an octave, used with % to do round-robin over all notes
  //Check if all inputs arguments are received 
  const baseHz = 261.625565;// This is the Hz value of C4 (middle C), which is represented by 0 in allNotes
  const baseSemitone = 2**(1/12);
  if(arguments.length<4){return('Please fill out all input fields');}
 let chordIn = CHORD ? CHORD.toLowerCase().replace(/ /g, '') : false;
 if(chordIn[0]!='a'&chordIn[0]!='b'&chordIn[0]!='c'&chordIn[0]!='d'&chordIn[0]!='e'&chordIn[0]!='f'&chordIn[0]!='g'){chordIn=false;}
 if(chordIn == false ){return('Please input a valid chord!')}

  let keyIn = KEY? KEY.toLowerCase().replace(/ /g, '') : false;
  let styleIn = STYLE? STYLE.toLowerCase().replace(/ /g, '') : false;
  let directionIn = DIRECTION? DIRECTION.toLowerCase().replace(/ /g, '') : false;
  const allScales = {
    'major': {'notes': [0,2,4,5,7,9,11], 'mode':0, 'quality':'maj7'},
    'dorian':{'notes':[0,2,3,5,7,9,10],'mode':2, 'quality':'min7'},
    'phrygian':{'notes':[0,1,3,5,7,8,10],'mode':4, 'quality':'min7'},
    'lydian':{'notes':[0,2,4,6,7,9,11],'mode':5, 'quality':'maj7'},
    'mixolydian': {'notes': [0,2,4,5,7,9,10],'mode':7, 'quality':'dom7'},
    'minor': {'notes': [0,2,3,5,7,8,10],'mode':9, 'quality':'min7'},
    'locrian': {'notes': [0,1,3,5,6,8,10],'mode':11, 'quality':'min7b5'},
    'melodic minor': {'notes': [0,2,3,5,7,9,11]},
    'whole tone': {'notes': [0,2,4,6,8,10]},
    'h diminished': {'notes':[0,1,3,4,6,7,9,10]},
    'w diminished' : {'notes':[0,2,3,5,6,8,9,11]}
  };
  const allChords = {
    'aug':{'names':['augmented','aug'], 'tones':[0,4,8], 'scale':'whole tone'},//scale in chords is default if no key is specified (chord assumed to be tonic)
    'min7b5':{'names':['min7b5','minor7b5','-7b5','half'], 'tones':[0,3,6,10], 'scale':'locrian'},
    'minmaj7':{'names': ['minmaj','-maj','minor-major','minormajor'], 'tones':[0,3,7,11], 'scale':'melodic minor'},
    'maj7':{'names':['maj'], 'tones': [0,4,7,11],'scale': 'major'},
    'dim7':{'names':['dim','diminished','fully'],'tones':[0,3,6,9], 'scale':'w diminished'},
    'sus2':{'names':['sus2','suspended2'],'tones':[0,2,7],'scale':'major'},
    'sus4':{'names':['sus4','suspended4'],'tones':[0,5,7],'scale':'major'},
    'sus7':{'names':['sus','suspended'],'tones':[0,2,5,7,10],'scale':'mixolydian'},
    'min7': {'names':['min','-','m'], 'tones':[0,3,7,10], 'scale':'minor'},
    'dom7':{'names':['dom','7'], 'tones':[0,4,7,10], 'scale':'mixolydian'},
    'maj':{'names':['', ' '], 'tones':[0,4,7], 'scale':'major'}//just a major triad in case there is no quality in input ex "Gb" will use Gb major triad MUST BE AT BOTTOM OF LIST
  };

  const allNotes = {
    'sharps': {0:'C', 1:'C#', 2:'D', 3:'D#', 4:'E', 5:'F', 6:'F#', 7:'G', 8:'G#', 9:'A', 10:'A#', 11:'B'},
    'flats':{0:'C', 1:'Db', 2:'D', 3:'Eb', 4:'E', 5:'F', 6:'Gb', 7:'G', 8:'Ab', 9:'A', 10:'Bb', 11:'B'}
  };
    //function create reversed key value pairs of notes
  function invertNotes(notes){
  let invertedNotes = {};
  for (let key in notes){
    invertedNotes[key] = {};
    for (let key2 in notes[key]){
  invertedNotes[key][notes[key][key2]]=parseInt(key2, 10);
    }
   }
    return invertedNotes;
  }
  //call invertNotes on allNotes
  const intNotes = invertNotes(allNotes);

  //function to bind notes to the 0-11 in allNotes
  function bindNote(note){
  return ( ( Math.abs((note%oct)+oct) )%oct );
}
  
  const allKeys = {
    'sharps': ['F#', 'B', 'E', 'A', 'D', 'G', 'C', 'C#', 'D#', 'G#', 'A#'],
    'flats': ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']
  };
  
  //function to get note names from note integer arrays
 function getNoteNames (arrIntNotes,sharpsOrFlats){
      let names = [];
      for(let note in arrIntNotes){
        names.push(allNotes[sharpsOrFlats][ bindNote( arrIntNotes[bindNote(note) ] )] );
      }
      return names;
    } 
  function getHz (intNote){
    let floatHz = baseHz*baseSemitone**intNote;
    let fixedHz = floatHz.toFixed(6);
    return ( fixedHz ); 
  }
///////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Define object constructors ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

  //chord object constructor
  function Chord (chordName, direction){
    let self = this;
    self.chordName = chordName;
    self.strRoot = (function (chord){
    let root = 0;
     if (chord[1]!='#' && chord[1]!='b')
       {  
       root = chord[0].toUpperCase(); 
       }
       else
       {
       root = chord[0].toUpperCase()+chord[1];
       }
       return (root);
       }(self.chordName) );//IIFE
    self.sharpOrFlat = (function (rootIn){
    let sharpsOrFlats = 'flats';
      for (let roots in allKeys['sharps']){
       if (rootIn == allKeys['sharps'][roots]){
          sharpsOrFlats ='sharps';
            }
          }
         return sharpsOrFlats;
        }(self.strRoot) );//IIFE
    self.intRoot = intNotes[self.sharpOrFlat][self.strRoot];
    self.quality = (function (chord){
         let quality = 'quality not found!';
         for(let qualities in allChords){
           for(let names in allChords[qualities]['names']){
             if((chord).match(allChords[qualities]['names'][names])){
                quality = allChords[qualities];
                return quality;
                break;
                }
             }
          }
       }(self.chordName) );//IIFE
    self.tones = (  function (rootIn, qualityIn){
         let tones = [];
         for(let tone in qualityIn['tones']){
           if (direction=='down'){
          tones.unshift( qualityIn['tones'][tone]+rootIn );
           }
           else{
           tones.push( qualityIn['tones'][tone]+rootIn );
           }
         }
         return tones;
       }(self.intRoot, self.quality) );//IIFE
      }
  
  //Melody object constructor
  function Melody (chord, key, rhythm, duration){
    var self = this;
    self.chord = chord;
    self.key = key;
    self.strTonic = (function (key){
      let root = 0;
      if(self.key){
       if (key[1]!='#' && key[1]!='b')
          {  
          root = key[0].toUpperCase(); 
          }
          else
          {
          root = key[0].toUpperCase()+key[1];
         }
        }
        else{
          root = 'No key';
        }
         return (root);
         }(self.key) );//IIFE
    self.minor = (function(key){
      let isMinor = false;
      if(self.key){
        if( /min/.test(key) || /-/.test(key) ){
          isMinor = true;
        }
      }
       return isMinor;
       }(self.key) );//IIFE
    self.intTonic = (function(tonic){ 
      let tonicOut=0;
      if(self.minor){
        tonicOut = bindNote( intNotes[self.chord.sharpOrFlat][self.strTonic] + 3 );
      }
      else{
        tonicOut = intNotes[self.chord.sharpOrFlat][self.strTonic];
      }
      return tonicOut;
    }(self.strTonic) );//IIFE   
    self.chordScale = (function(){
      let chordScaleOut = allScales[self.chord.quality['scale']]['notes'];
        if(self.key ){
          let mode = self.chord.intRoot - self.intTonic ;
          if( allScales['major']['notes'].includes(mode) ) {
            for(let scale in allScales){
              if(allScales[scale].hasOwnProperty('mode')){
                if(allScales[scale]['mode']==mode){
                  chordScaleOut = allScales[scale]['notes'];
                }
              }
            }
          }
       }
        return chordScaleOut;
      }());//IIFE
    self.tones = self.chord.tones;
    self.direction = directionIn;
    self.rhythm = rhythm;
    self.duration = duration;
    self.notes =[]; 
    self.scale = (function(){
        let scaleNotes = [];
        for (let note in self.chordScale){
          scaleNotes.push( self.chordScale[note]+self.chord.intRoot );
          }
        return scaleNotes;
      }());//IIFE
    self.belowNote = function(tone){
      return (tone-1);
    }
    self.aboveNote = function(tone){
      let indexAbove = self.scale.indexOf(tone)+1;
      let scaleLength = self.scale.length;
      let scaleToneAbove = self.scale[ indexAbove % scaleLength ];
            // debugger;
      let differencePlusOctave =scaleToneAbove-tone + 12*Math.floor(indexAbove/scaleLength) ;

      return ( tone + differencePlusOctave);
    }
    self.approachBelow = ( function(){ //self method returns an array of note integers
      let approachBelowNotes = [];
        self.tones.forEach(function(tone, index){
          approachBelowNotes.push(self.belowNote(tone));
          approachBelowNotes.push(tone);
        });
      return (approachBelowNotes);
    } ());//IIFE
    
    self.approachAbove = (function(){
     // determine whether to start a whole or half-step above using scale from quality and allScales and use array.indexOf to find where the chord tones fall in the scale to get above notes
      let approachAboveNotes = [];
      self.tones.forEach(function(tone, index){
//            approachAboveNotes.push(self.scale[ (self.scale.indexOf(tone)+1)%self.scale.length ]);
            approachAboveNotes.push(self.aboveNote(tone) );
            approachAboveNotes.push(tone);
                         });
      return approachAboveNotes;
    }() );//IIFE
    self.aboveBelow = (function(){
      //Do mix of diatonic above and chromatic below notes depending on chord
      let aboveBelowNotes = [];
      self.tones.forEach(function(tone, index){
        if( self.tones[ (index+1) % self.tones.length ] - tone > 3 ){//check if the interval to next chord tone is larger than minor 3rd
           aboveBelowNotes.push(self.aboveNote(tone) );
           aboveBelowNotes.push(tone);
        }
        else{
           aboveBelowNotes.push(self.belowNote(tone) );
           aboveBelowNotes.push(tone);
        }
      });
      return aboveBelowNotes;
    }() );//IIFE
    self.surround3 = (function(){
    	let surround3Notes = [];
    	self.tones.forEach(function(tone, index){
    		surround3Notes.push(self.aboveNote(tone) );
    		surround3Notes.push(self.belowNote(tone) );
    		surround3Notes.push(tone);
    	});
    		return (surround3Notes);
    } () );//IIFE
    self.surround4 = (function(){
    	 let surround4Notes = [];
    	self.tones.forEach(function(tone,index){
           surround4Notes.push(self.aboveNote(tone) );    		
	    			if( ( self.aboveNote(tone) - tone ) > 1 ) {
	    				surround4Notes.push(tone+1);
	    				surround4Notes.push(tone-1);  
	    			}
	    			else{
	    				surround4Notes.push(tone-2);
	    				surround4Notes.push(tone-1);
	    			}
		surround4Notes.push(tone); 
    	})
      return (surround4Notes);
    }());//IIFE
  }

///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Use Object Constructors to Generate Output /////// /////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

  let inputChord = new Chord(chordIn, directionIn);
  
  let inputMelody = new Melody(inputChord, keyIn, '8th',1);

  function getOutputMelody(){
    let notesOut = 0;
    if(styleIn == 'below'){
    notesOut = inputMelody.approachBelow;
    }
    else if(styleIn == 'above'){
    notesOut = inputMelody.approachAbove;
    }
    else if(styleIn == 'mix'){
      notesOut = inputMelody.aboveBelow;
      }
    else if(styleIn == 'surround3'){
      notesOut = inputMelody.surround3;
    }
    else if(styleIn == 'surround4'){
      notesOut = inputMelody.surround4;
    }
    else{
      notesOut = inputMelody.approachAbove;//approach from above is default
    }          
    return notesOut;
  }

  let outputMelody = getOutputMelody();
// debugger;
  let outputNoteNames = getNoteNames(outputMelody, inputMelody.chord.sharpOrFlat);

  let outNotesSpaces = (function (){ 
    let outArr = [];
    outputNoteNames.forEach(function(note, index){
      outArr.push ( note = note+' ');
  });
  return outArr;
}());//IIFE
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Get notes for audio and play using Tone Transport //////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
let soundNotes = 0;
soundNotes = (function(){
let outNotes = [];
outNotes[0]=1000000000;
outputMelody.forEach(function(note, index){
  outNotes.push(getHz(note));
})
return outNotes;
}());//IIFE
let loopIndex = 0;
let melodyLength = soundNotes.length;
// debugger;
let loop = new Tone.Loop(function(time){
  let note =null;
  note = soundNotes[loopIndex % melodyLength];
  synth.triggerAttackRelease(note, "8n", time)
  loopIndex++;
}, "8n")

loop.start(0).stop('0:'+melodyLength/2+':0');

$('.target').show();//unhide Palay Notes button

$('button#playNotes').click(function(event){
  event.preventDefault();
  // debugger;
  Tone.Transport.stop();
  Tone.Transport.start();
  // debugger;
} );

//////////////////////////// Final Return Output //////////////////////////////////

// debugger;

return (outNotesSpaces);  

}//end of BEBOPOBJ