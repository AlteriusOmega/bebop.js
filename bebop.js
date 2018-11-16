///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Create and configure synth object and sound output /////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function makeSynth(){
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
return synth;
}

const synth = makeSynth();

//Function to schedule notes into transport
function scheduleNotes(arrMelody){
let soundNotes = 0;
soundNotes = (function(){
let outNotes = [];
outNotes[0]=1000000000;
arrMelody.forEach(function(note, index){
  outNotes.push(note);
})
return outNotes;
}());//IIFE
let loopIndex = 0;
let melodyLength = soundNotes.length;
let loop = new Tone.Loop(function(time){
  let note =null;
  note = soundNotes[loopIndex % melodyLength];
  synth.triggerAttackRelease(note, "8n", time)
  loopIndex++;
}, "8n")
Tone.Transport.cancel(0);
loop.start(0).stop('0:' + melodyLength / 2 + ':0');
}
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Get Input From HTML Page Forms ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
$(".target" ).hide();//Hide play notes button until notes are shown on page forom BEBOPOBJ output

$('button#runBebop').click(function(event){
event.preventDefault();
let chordFromHtml =  $('input#bebopIn').val() ;
let keyFromHtml = $('input#keyIn').val();
let styleFromHtml = $('input[name=style]:checked').val();
let directionFromHtml = $('input[name=direction]:checked').val();
$('h1#output').html(BEBOPOBJ(chordFromHtml, keyFromHtml, styleFromHtml, directionFromHtml));
} );



///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Define Constants and glbal functions ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
  const oct = 12; //number of half steps in an octave, used with % to do round-robin over all notes
  //Check if all inputs arguments are received 
  const baseHz = 261.625565;// This is the Hz value of C4 (middle C), which is represented by 0 in allNotes
  const baseSemitone = 2**(1/12);
  const baseOctave = 4;//base octave for what 0 represents - if set to 4, 0 = C4
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
    'min7b5':{'names':['min7b5','minor7b5','-7b5','half'], 'tones':[0,3,6,10,14], 'scale':'locrian'},
    'minmaj7':{'names': ['minmaj','-maj','minor-major','minormajor'], 'tones':[0,3,7,11,14], 'scale':'melodic minor'},
    'maj7':{'names':['maj'], 'tones': [0,4,7,11,14,16,18],'scale': 'major'},
    'dim7':{'names':['dim','diminished','fully'],'tones':[0,3,6,9], 'scale':'w diminished'},
    'sus2':{'names':['sus2','suspended2'],'tones':[0,2,7],'scale':'major'},
    'sus4':{'names':['sus4','suspended4'],'tones':[0,5,7],'scale':'major'},
    'sus7':{'names':['sus','suspended'],'tones':[0,2,5,7,10],'scale':'mixolydian'},
    'min7': {'names':['min','-','m'], 'tones':[0,3,7,10,14,17,19], 'scale':'minor'},
    'dom7':{'names':['dom','7','9','11','13'], 'tones':[0,4,7,10,14,16,18], 'scale':'mixolydian'},
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
  return ( ( (note%oct)+oct) )%oct ;
}
 function bindIndex(scale, index){ // more generalized version of bindNote, basically makes the remainder % operator into a real modulo
  return ( ( ( (index%scale.length)+scale.length) )% scale.length );
 }
  
  const allKeys = {
    'sharps': ['F#', 'B', 'E', 'A', 'D', 'G', 'C', 'C#', 'D#', 'G#', 'A#'],
    'flats': ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']
  };
  
  //function to get note names from note integer arrays
 function getNoteNames (arrIntNotes,sharpsOrFlats){
      let names = [];
      for(let note in arrIntNotes){
        names.push(allNotes[sharpsOrFlats][ bindNote( arrIntNotes[note] )] );
      }
      return names;
    } 
    //function to return which octave the passed note it in.
  function getOctave (note){
    let octave =  Math.floor(note/oct);
    return octave;
  }

  //get the note-octave syntax string array for an integer note array input ie - [0,12] --> ['C4','C5']
 function getNoteOctave (arrIntNotes, sharpsOrFlats){
  let names = [];
      for(let index in arrIntNotes){
        names.push(allNotes[sharpsOrFlats][ bindNote( arrIntNotes[index] )] + ( getOctave(arrIntNotes[index]) + baseOctave).toString() );
      }
      return names;
 }
  function getHz (intNote){
    let floatHz = baseHz*baseSemitone**intNote;
    let fixedHz = floatHz.toFixed(6);
    return ( fixedHz ); 
  }

  function moduloTrue (index, scaleLength){
    if(index % scaleLength != index){
      return true;
    }
    else {
      return false;
    }
  }
  //function to be able to access an index of a scale or other array that is outside of its length, but will automatically repeat the scale up or down as needed
  function infiniteScale(scale, index){//returns value of an index of a scale even if it is outside the range of that scale's length
    let note = 0;
    let octave = 0;
    octave = Math.floor(index/scale.length);
    note = scale[ bindIndex(scale, index) ] + oct*octave;
    return note;
  }
  //inverted infinite scale function, basically a .indexOf for values that are out of range of an array
  // function infiniteIndexOf (scale, note){
  //   let octave = getOctave(note);
  //   let index = 0;
  //   if (scale.indexOf(note) != -1){
  //     index = indexOf(note);
  //   }
  //   else {
  //     //todo, figure out how to find which "octave" this note would fall in this scale, even if the note value is negative
  //     if
  //   }
  //   return index;
  // }
  function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
  }

  let testGetNoteOctave = getNoteOctave([-13, 0, 25, 49], 'sharps');
  let testbindNote = bindNote(23);
  let testGetOctave = getOctave(11);
  let testInfiniteScale = infiniteScale(allScales['major']['notes'], -2);
  let testBindIndex = bindIndex(allScales['major']['notes'], -1);
///////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Define object constructors ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

  //chord object constructor
  function Chord (chordName, direction){
    let self = this;
    self.chordName = chordName;
    self.direction = direction;
    self.strRoot = (function (){
    let root = 0;
     if (self.chordName[1]!='#' && self.chordName[1]!='b')
       {  
       root = self.chordName[0].toUpperCase(); 
       }
       else
       {
       root = self.chordName[0].toUpperCase()+self.chordName[1];
       }
       return (root);
       }() );//IIFE
    self.sharpOrFlat = (function (){
    let sharpsOrFlats = 'flats';
      for (let roots in allKeys['sharps']){
       if (self.strRoot == allKeys['sharps'][roots]){
          sharpsOrFlats ='sharps';
            }
          }
         return sharpsOrFlats;
        }() );//IIFE
    self.intRoot = intNotes[self.sharpOrFlat][self.strRoot];
    self.quality = (function (){
         let quality = 'quality not found!';
         for(let qualities in allChords){
           for(let names in allChords[qualities]['names']){
             if((self.chordName).match(allChords[qualities]['names'][names])){
                quality = allChords[qualities];
                return quality;
                break;
                }
             }
          }
       }() );//IIFE
    self.tones = (  function (){
      let extensions = 0;
      if( self.chordName.match(/7|9|11|13/) )
      {
          extensions = self.chordName.match(/7|9|11|13/);//this is the match return, which should be an array
      }
      let toneLength = 0;
      switch( extensions[0]) {
            case '7':
                toneLength = 4;
                break; 
            case '9':
                toneLength = 5;
                break;
            case '11':
                toneLength = 6;
                break;
            case '13':
                toneLength = 7;
                break;
            default://if there is no extension entered, should use length 3
                toneLength = 3;
                break;
          }
          if (toneLength > self.quality['tones'].length){
            toneLength = self.quality['tones'].length;
          }
         let tones = [];
         let i = 0;
         for(i = 0; i < toneLength; i++){
           if (self.direction=='down'){
          tones.unshift( self.quality['tones'][i]+self.intRoot );
           }
           else{
           tones.push( self.quality['tones'][i]+self.intRoot );
           }
         }
         return tones;
       }() );//IIFE
      }
  
  //Melody object constructor
  function Melody (chord, key, rhythm, duration){
    var self = this;
    self.chord = chord;
    self.key = key;
    self.strTonic = (function (){
      let root = 0;
      if(self.key){
       if (self.key[1]!='#' && self.key[1]!='b')
          {  
          root = self.key[0].toUpperCase(); 
          }
          else
          {
          root = self.key[0].toUpperCase()+self.key[1];
         }
        }
        else{
          root = 'No key';
        }
         return (root);
         }() );//IIFE
    self.minor = (function(key){
      let isMinor = false;
      if(self.key){
        if( /min/.test(key) || /-/.test(key) ){
          isMinor = true;
        }
      }
       return isMinor;
       }(self.key) );//IIFE
    self.intTonic = (function(){ 
      let tonicOut=0;
      if(self.minor){
        tonicOut = bindNote( intNotes[self.chord.sharpOrFlat][self.strTonic] + 3 );
      }
      else{
        tonicOut = intNotes[self.chord.sharpOrFlat][self.strTonic];
      }
      return tonicOut;
    }() );//IIFE   
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
    self.rhythm = rhythm;
    self.duration = duration;
    self.notes =[]; 
    self.scale = (function(){
        let scaleNotes = [];
        for (let note in self.chordScale){
          scaleNotes.push(  self.chordScale[note]+self.chord.intRoot  );
          }
        return scaleNotes;
      }());//IIFE
    self.belowNote = function(tone){
      return (tone-1);
    }
    self.aboveNote = function(tone){
      let index = 0;
      let currentIndex = 0;
      let scaleLength = self.scale.length;
      let toneOctave = getOctave(tone);
      let moduloFactor = 0;
          for(index=0; index < scaleLength*2 ; index ++){//todo find a way to not have to hardcode number of times it will keep going up past scale limit
            if( infiniteScale(self.scale, index)  === tone  ){//todo, don't know for sure that the tone will be in the scale, need invetred infiniteScale function
             currentIndex = index;
            }
            else {
              if(infiniteScale(self.scale, index) < tone && infiniteScale(self.scale, index+1) > tone){
                currentIndex = index;
              }
            }
          }
      return(infiniteScale(self.scale,currentIndex+1));
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
      // debugger;
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
      let toneInterval = 0;
      self.tones.forEach(function(tone, index){
        if(self.chord.direction == 'down'){
          toneInterval = Math.abs(tone - self.tones[ (index-1) % self.tones.length ]);
        }
        else{
          toneInterval = Math.abs(self.tones[ (index+1) % self.tones.length ] - tone);
        }
        let enoughRoomForAboveTone = (toneInterval > 3);
        if( enoughRoomForAboveTone ){//check if the interval to next chord tone is larger than minor 3rd   
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
    	});
      return (surround4Notes);
    }());//IIFE
    self.randomMix = (function(){
      let randomNum = getRandomInt(4);
      //use switch case and getRandomInt(5) to choose between different methods 

    } () )//IIFE 
  }


///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Main Function ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function BEBOPOBJ(CHORD, KEY, STYLE, DIRECTION) {

$('.target').show();//unhide Palay Notes button

////////////////////////////////////// Handle Bad Input ///////////////////////////////////////////
 let chordIn = CHORD ? CHORD.toLowerCase().trim() : false;
 if(chordIn[0] !='a' & chordIn[0] != 'b' & chordIn[0] != 'c' & chordIn[0] != 'd' &
    chordIn[0] !='e' & chordIn[0] != 'f' & chordIn[0] != 'g'){
  chordIn = false;
}
 if(chordIn == false ){return('Please input a valid chord!')}

  let keyIn = KEY ? KEY.toLowerCase().replace(/ /g, '') : false;
  let styleIn = STYLE ? STYLE.toLowerCase().replace(/ /g, '') : false;
  let directionIn = DIRECTION ? DIRECTION.toLowerCase().replace(/ /g, '') : false;


///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Use Object Constructors to Generate Output /////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

  let inputChord = new Chord(chordIn, directionIn);
  
  let inputMelody = new Melody(inputChord, keyIn, '8th',1);//todo implement triplets

  function getOutputMelody(){//todo change to switch case!
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
      notesOut = inputMelody.aboveBelow;//aboveBelow is default, most common and jazzy sounding
    }          
    return notesOut;
  }

  let outputMelody = getOutputMelody();
  let outputMelodyNoteOctave = getNoteOctave(outputMelody, inputMelody.chord.sharpOrFlat);
  let outputNoteNames = getNoteNames(outputMelody, inputMelody.chord.sharpOrFlat);
  function formatOutput(arrIn){ 
    let outArr = [];
    arrIn.forEach(function(note, index){
      outArr.push ( note );
      outArr.push (' ');
  });
  return outArr;
}

  let outNotesSpaces = formatOutput(outputNoteNames);

////////////////// Get notes for audio and play using Tone Transport //////////////

$('button#playNotes').click(function(event){
  event.preventDefault();
  scheduleNotes(outputMelodyNoteOctave);
  Tone.Transport.stop();
  Tone.Transport.start();
} );

//////////////////////////// Final Return Output //////////////////////////////////
// debugger;
return (outNotesSpaces);  

}//end of Main function BEBOPOBJ