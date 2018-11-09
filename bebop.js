$("button#runBebop").click(function(event){
var val =  $("input#bebopIn").val() ;
event.preventDefault();
$("p#output").html(BEBOPOBJ(val));

} );

 var testInput = 'G#Maj7';

function BEBOPOBJ(input) {

  const oct = 12; //number of half steps in an octave, used with % to do round-robin over all notes
  const chordIn = input.toLowerCase().replace(/ /g, '');
  const allScales = {
    'major': {'notes': [0,2,4,5,7,9,11]},
    'minor': {'notes': [0,2,3,5,7,8,10]},
    'melodic minor': {'notes': [0,2,3,5,7,9,11]},
    'mixolydian': {'notes': [0,2,4,5,7,9,10]},
    'locrian': {'notes': [0,1,3,5,6,8,10]},
    'whole tone': {'notes': [0,2,4,6,8,10]}
  };
  const allChords = {
    'aug':{'names':['augmented','aug'], 'tones':[0,4,8], 'scale':'whole tone'},
    'min7b5':{'names':['min7b5','minor7b5','-7b5','half'], 'tones':[0,3,6,10], 'scale':'locrian'},
    'minmaj7':{'names': ['minmaj','-maj','minor-major','minormajor'], 'tones':[0,3,7,11], 'scale':'melodic minor'},
    'maj7':{'names':['maj'], 'tones': [0,4,7,11],'scale': 'major'},
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
  var invertedNotes = {};
  for (var key in notes){
    invertedNotes[key] = {};
    for (var key2 in notes[key]){
  invertedNotes[key][notes[key][key2]]=parseInt(key2, 10);
    }
   }
    return invertedNotes;
  }
  //function to bind notes to the 0-11 in allNotes
  function bindNote(note){
  return note%oct;
}
  
  //call invertNotes on allNotes
  const intNotes = invertNotes(allNotes); /* ? */
  
  const allKeys = {
    'sharps': ['F#', 'B', 'E', 'A', 'D', 'G', 'C', 'C#', 'D#', 'G#', 'A#'],
    'flats': ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']
  };
  
  //function to get note names from note integer arrays
 function getNoteNames (arrIntNotes,sharpsOrFlats){
      var names = [];
      for(var note in arrIntNotes){
        names.push(allNotes[sharpsOrFlats][ bindNote( arrIntNotes[note] ) ]);
      }
      return names;
    } 
  
  //chord object constructor
  function chord (chordName){
    var self = this;
    self.chordName = chordName;
    self.strRoot = (function (chordIn){
    var root = 0;
     if (chordIn[1]!='#' && chordIn[1]!='b')
       {  
       root = chordIn[0].toUpperCase(); 
       }
       else
       {
       root = chordIn[0].toUpperCase()+chordIn[1];
       }
       return (root);
       }(self.chordName) );//IIFE
    self.sharpOrFlat = (function (rootIn){
    var sharpsOrFlats = 'flats';
      for (var roots in allKeys['sharps']){
       if (rootIn == allKeys['sharps'][roots]){
          sharpsOrFlats ='sharps';
            }
          }
         return sharpsOrFlats;
        }(self.strRoot) );//IIFE
    self.intRoot = intNotes[self.sharpOrFlat][self.strRoot];
    self.quality = (function (chordIn){
         var quality = 'quality not found!';
         for(var qualities in allChords){
           for(var names in allChords[qualities]['names']){
             if((chordIn).match(allChords[qualities]['names'][names])){
                quality = allChords[qualities];
                return quality;
                break;
                }
             }
          }
       }(self.chordName) );//IIFE
    self.tones = (  function (rootIn, qualityIn){
         var tones = [];
         for(var tone in qualityIn['tones']){
           tones.push( bindNote(qualityIn['tones'][tone]+rootIn) );
         }
         return tones;
       }(self.intRoot, self.quality) );//IIFE
      }
  
  //melody object constructor
  function melody (chord, direction, rhythm, duration){
    var self = this;
    self.chord = chord;
    self.chordScale = allScales[self.chord.quality['scale']]['notes'];
    self.tones = self.chord.tones;
    self.direction = direction;
    self.rhythm = rhythm;
    self.duration = duration;
    self.notes =[]; 
    self.scale = (function(){
        var scaleNotes = [];
        for (var note in self.chordScale){
          scaleNotes.push( bindNote(self.chordScale[note]+self.chord.intRoot) );
        }
        return scaleNotes;
      }());//IIFE
    self.belowNote = function(tone){
      return (tone-1);
    }
    self.aboveNote = function(tone){
      return (self.scale[ (self.scale.indexOf(tone)+1)%self.scale.length ] );
    }
    self.approachBelow = ( function(){ //self method returns an array of note integers
      var approachBelowNotes = [];
        for (var index in self.tones){
           approachBelowNotes.splice( index*2, 0, bindNote( self.tones[index]-1) );
           approachBelowNotes.splice( index+1, 0, bindNote (self.tones[index]) );
        }
      return (approachBelowNotes);
    } ());//IIFE
    
    self.approachAbove = (function(){
     // determine whether to start a whole or half-step above using scale from quality and allScales and use array.indexOf to find where the chord tones fall in the scale to get above notes
      var approachAboveNotes = [];
      self.tones.forEach(function(tone, index){
//            approachAboveNotes.push(self.scale[ (self.scale.indexOf(tone)+1)%self.scale.length ]);
            approachAboveNotes.push(self.aboveNote(tone) );
            approachAboveNotes.push(tone);
                         });
      return approachAboveNotes;
    }() );//IIFE
    self.aboveBelow = (function(){
      //Do mix of diatonic above and chromatic below notes depending on chord
      var aboveBelowNotes = [];
      var aboveOrBelow = 'above';
      self.tones.forEach(function(tone, index){
        if(aboveOrBelow ==='above'){
           aboveBelowNotes.push(self.aboveNote(tone) );
           aboveBelowNotes.push(tone);
           aboveOrBelow = 'below'
        }
        else{
           aboveBelowNotes.push(self.belowNote(tone) );
           aboveBelowNotes.push(tone);
           aboveOrBelow = 'above'
        }
        return aboveBelowNotes;
      });
    }() );//IIFE
    self.surround3 = (function(){
    	var surround3Notes = [];
    	self.tones.forEach(function(tone, index){
    		surround3Notes.push(self.aboveNote(tone) );
    		surround3Notes.push(self.belowNote(tone) );
    		surround3Notes.push(tone);
    	});
    		return (surround3Notes);
    } () );//IIFE
    self.surround4 = (function(){
    	 var surround4Notes = [];
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
    self.noteNames = getNoteNames(self.approachAbove, self.chord.sharpOrFlat);
  }

  var newChord = new chord(chordIn);
  
  var newMelody = new melody(newChord,'up','8th',1);

 const synth = new Tone.Synth();

 // play sounds of output

 synth.oscillator.type = 'sawtooth';
const gain = new Tone.Gain(0.9);
gain.toMaster();
synth.connect(gain);

// synth.triggerAttackRelease('C5','8n')

var soundNotes = (function(){
  var outNotes = [];
  for (var note in newMelody.noteNames ){
outNotes.push(newMelody.noteNames[note] +'3');
  }
  return outNotes;
}());

var index = 0;

Tone.Transport.scheduleRepeat(time => {
	repeat(time);
}, '8n');

Tone.Transport.bpm.value = 90;

function repeat(time){
	var note = soundNotes[index % soundNotes.length];
	synth.triggerAttackRelease(note, '8n', time);
	index++;
}

Tone.Transport.start();

setTimeout( ()=> {
  Tone.Transport.stop();
},5000)
console.log ('reached the end of script');

// debugger;
return (newMelody.noteNames);  
}
function testRun(){
  var testChord = 'CMaj7';
  BEBOPOBJ(testChord);
}