/* -----------------------------------------------------------------------
 Bust-A-Move Bust!.t
 David Shi
 June 13 2007

 This game is called Bust-A-Move Bust and is an imitation from the
 original classical game Bubble Bobble. Most graphics are from the original
 game and the game play is almost the same besides some additional features
 like music, no-point system, and lives.

 The purpose of this game is to match 3 or more bubbles of the same colours
 to get rid of all the bubbles. There are 12 levels in total.
 ----------------------------------------------------------------------- */

/* -----------------------------------------------------------------------
 Intro Screen
 ----------------------------------------------------------------------- */

drawfillbox (0, 0, maxx, maxy, 58)
Pic.ScreenLoad ("../turing_assets/mainTitle.bmp", maxx div 2 - 148, maxy div 2 - 152, picCopy)
Pic.ScreenLoad ("../turing_assets/play.bmp", 15, 180, picMerge)
Pic.ScreenLoad ("../turing_assets/what.bmp", 483, 178, picMerge)

Music.PlayFileLoop ("../music/Hellogoodbye - Shimmy Shimmy Quarter Turn.mp3")

loop %when loop exits, the real game begins
    var mx, my, mb : int
    mousewhere (mx, my, mb)

    if mb = 1 and mx >= 12 and mx <= 173 and my >= 165 and my <= 246 then
	exit
    elsif mx >= 12 and mx <= 173 and my >= 165 and my <= 246 then
	drawbox (12, 173, 161, 246, white)
	drawbox (11, 172, 162, 247, white)
	drawbox (10, 171, 163, 248, white)
    elsif mb = 1 and mx > 484 and mx <= 629 and my >= 171 and my <= 253 then %instructions screen - gives brief discussion and controls of games
	drawfillbox (0, 0, maxx, maxy, yellow)
	Pic.ScreenLoad ("../turing_assets/back.bmp", 240, 5, picMerge)
	Pic.ScreenLoad ("../turing_assets/instructions.bmp", 16, 50, picMerge)
	loop
	    mousewhere (mx, my, mb)
	    if mb = 1 and mx >= 240 and mx <= 422 and my >= 8 and my <= 40 then %back button
		exit
	    elsif mx >= 240 and mx <= 422 and my >= 8 and my <= 40 then
		drawbox (240, 8, 422, 40, white)
		drawbox (239, 7, 423, 41, white)
		drawbox (238, 6, 424, 42, white)
	    else
		drawbox (240, 8, 422, 40, 46)
		drawbox (239, 7, 423, 41, 46)
		drawbox (238, 6, 424, 42, 46)
	    end if
	end loop
	drawfillbox (0, 0, maxx, maxy, 58) %goes back to introduction screen
	Pic.ScreenLoad ("../turing_assets/mainTitle.bmp", maxx div 2 - 148, maxy div 2 - 152, picCopy)
	Pic.ScreenLoad ("../turing_assets/play.bmp", 15, 180, picMerge)
	Pic.ScreenLoad ("../turing_assets/what.bmp", 483, 178, picMerge)
    elsif mx >= 481 and mx <= 629 and my >= 171 and my <= 253 then
	drawbox (481, 171, 629, 246, white)
	drawbox (480, 170, 630, 247, white)
	drawbox (479, 169, 631, 248, white)
    else
	drawbox (12, 173, 161, 246, 46)
	drawbox (11, 172, 162, 247, 46)
	drawbox (10, 171, 163, 248, 46)
	drawbox (481, 171, 629, 246, 46)
	drawbox (480, 170, 630, 247, 46)
	drawbox (479, 169, 631, 248, 46)
    end if
end loop

/* -----------------------------------------------------------------------
 GAME TIME!
 ----------------------------------------------------------------------- */

Music.PlayFileStop %stops introduction music

setscreen ("graphics:640;450,offscreenonly")

type bubbleType :
    record
	x, y : real
	c : int
    end record

var ang : real := 90 %beginning angle of shooter
var shotFired, shotLive : boolean := false %shotFired tells you if the space bar has been pressed, shotLive tells you if the bubble is moving
var vx, vy : real := 0 %variables for the ball
%x := maxx div 2 - 18 %where the ball begins
%y := 39
var shooterPic := Pic.FileNew ("../turing_assets/shooter.bmp") %picID for shooter
var gunbase := Pic.FileNew ("../turing_assets/gun.bmp") %picID for base of shooter
var picID : int %variable to take pictures of the shooter in all different angles
var shooterang : array 1 .. 180 of int %stores picture of the shooter
var xPos : array 1 .. 8, 1 .. 12 of int %xPos for the contents screen (coordinates)
var yPos : array 1 .. 8, 1 .. 12 of int %yPos for the contents screen (coordinates)
var contents : array 1 .. 8, 1 .. 12 of int %an array for the balls (screen)
var colourCount : int := 1  %used to find if 3 or more bubbles are touching each other
var i := 1 %global variable used to keep track of ball
var ballBackground : int := Pic.New (190, 90, 448, 404) %background of where the bubbles land
var background := Pic.FileNew ("../turing_assets/levelbackground2.bmp")
var coorx : int := 0 %this is x position in the array to assign colours to the content array
var coory : int := 0 %y position in the array
var spots : array 1 .. 3000 of bubbleType %array to store 3000 random coloured bubbles
var level : int := 0 %add 1 to enter the first level, this keeps track of what level you are on
var lives : int := 3
var gameoverscreen := Pic.FileNew ("../turing_assets/gameover.bmp") %picture when you lose
var gameoverscreen2 := Pic.FileNew ("../turing_assets/gameover2.bmp") %picture when you win
var arrayofbubbles : array 1 .. 8 of int %put bubbles into arrays
arrayofbubbles (1) := Pic.FileNew ("../turing_assets/bluebubble.bmp")
arrayofbubbles (2) := Pic.FileNew ("../turing_assets/greenbubble.bmp")
arrayofbubbles (3) := Pic.FileNew ("../turing_assets/greybubble.bmp")
arrayofbubbles (4) := Pic.FileNew ("../turing_assets/orangebubble.bmp")
arrayofbubbles (5) := Pic.FileNew ("../turing_assets/purplebubble.bmp")
arrayofbubbles (6) := Pic.FileNew ("../turing_assets/yellowbubble.bmp")
arrayofbubbles (7) := Pic.FileNew ("../turing_assets/redbubble.bmp")
arrayofbubbles (8) := Pic.FileNew ("../turing_assets/whitebubble.bmp")

for k : 1 .. 180     %takes picture of the shooter in all angles
    picID := Pic.Rotate (shooterPic, round (k) - 90, 63, 59)
    shooterang (k) := picID
end for

Pic.Free (shooterPic) %no longer need the picture

/* -----------------------------------------------------------------------
 Setting the coordinates for the array to get the specific pattern for
 the bubbles to fit in
 ----------------------------------------------------------------------- */

for x2 : 1 .. 8
    for y2 : 1 .. 12
	contents (x2, y2) := 0
	if y2 mod 2 = 1 then %odd numbered rows
	    xPos (x2, y2) := 16 + 190 + (32 * (x2 - 1)) %add 189 which is the x coord. for the left side
	    yPos (x2, y2) := 404 - 16 - (28 * (y2 - 1))
	else
	    if x2 <= 7 then %only 7 balls in even numbered rows
		xPos (x2, y2) := 32 + 190 + (32 * (x2 - 1))
		yPos (x2, y2) := 404 - 16 - (28 * (y2 - 1))
	    else %x2 = 8 there are only 7 balls in the even numbered rows
		xPos (x2, y2) := 0
		yPos (x2, y2) := 0
	    end if
	end if
    end for
end for

for j : 1 .. 3000 %stores all 3000 random coloured bubbles into the array
    spots (j).x := maxx div 2 - 18
    spots (j).y := 39
    spots (j).c := Rand.Int (1, 8)
end for

/* -----------------------------------------------------------------------
 This (gameLevel) is a procedure for all the game levels.
 ----------------------------------------------------------------------- */

proc gameLevel (var contents : array 1 .. 8, 1 .. 12 of int)
    /*(1)("../turing_assets/bluebubble.bmp")
     (2)("../turing_assets/greenbubble.bmp")
     (3)("../turing_assets/greybubble.bmp")
     (4)("../turing_assets/orangebubble.bmp")
     (5)("../turing_assets/purplebubble.bmp")
     (6)("../turing_assets/yellowbubble.bmp")
     (7)("../turing_assets/redbubble.bmp")
     (8)("../turing_assets/whitebubble.bmp")
     */

    for y2 : 1 .. 12 %delete all balls in array for a fresh level
	for x2 : 1 .. 8
	    contents (x2, y2) := 0
	end for
    end for

    if level = 1 then
	Music.PlayFileLoop ("../music/The Postal Service - Such Great Heights.mp3")

	contents (1, 1) := 7 %specify what bubbles are in the array
	contents (2, 1) := 7
	contents (3, 1) := 6
	contents (4, 1) := 6
	contents (5, 1) := 1
	contents (6, 1) := 1
	contents (7, 1) := 2
	contents (8, 1) := 2

	contents (1, 2) := 7
	contents (2, 2) := 7
	contents (3, 2) := 6
	contents (4, 2) := 6
	contents (5, 2) := 1
	contents (6, 2) := 1
	contents (7, 2) := 2

	contents (1, 3) := 1
	contents (2, 3) := 1
	contents (3, 3) := 2
	contents (4, 3) := 2
	contents (5, 3) := 7
	contents (6, 3) := 7
	contents (7, 3) := 6
	contents (8, 3) := 6

	contents (1, 4) := 1
	contents (2, 4) := 1
	contents (3, 4) := 2
	contents (4, 4) := 2
	contents (5, 4) := 7
	contents (6, 4) := 7
	contents (7, 4) := 6

    elsif level = 2 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/royksopp - Remind Me.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground3.bmp") %PicID for new background
	Pic.Draw (background, 0, 0, picCopy) %draws new background

	contents (4, 1) := 3
	contents (5, 1) := 3

	for y : 2 .. 8
	    contents (4, y) := Rand.Int (1, 8)
	end for

    elsif level = 3 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/hellogoodbye - here (in your arms).mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground4.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (1, 1) := 2
	contents (8, 1) := 2

	contents (1, 2) := 7
	contents (2, 2) := 2
	contents (3, 2) := 1
	contents (4, 2) := 6
	contents (5, 2) := 7
	contents (6, 2) := 2
	contents (7, 2) := 1

	contents (1, 3) := 6
	contents (3, 3) := 6
	contents (8, 3) := 6

	contents (1, 4) := 1
	contents (2, 4) := 6
	contents (3, 4) := 7
	contents (4, 4) := 2
	contents (5, 4) := 1
	contents (6, 4) := 6
	contents (7, 4) := 7

	contents (4, 4) := 7
	contents (4, 5) := 2
	contents (4, 6) := 7

    elsif level = 4 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/Techno - Sand Storm.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (2, 1) := 7
	contents (3, 1) := 3
	contents (6, 1) := 1
	contents (7, 1) := 1

	contents (2, 2) := 8
	contents (6, 2) := 5

	contents (2, 3) := 1
	contents (6, 3) := 2

	contents (2, 4) := 8
	contents (6, 4) := 2

	contents (2, 5) := 8
	contents (6, 5) := 2

	contents (2, 6) := 7
	contents (6, 6) := 8

	contents (2, 7) := 8
	contents (6, 7) := 1

	contents (2, 8) := 7
	contents (6, 8) := 2

    elsif level = 5 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/The Postal Service - Such Great Heights.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground2.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (2, 1) := 7
	contents (4, 1) := 6
	contents (5, 1) := 6
	contents (7, 1) := 5

	contents (1, 2) := 2
	contents (3, 2) := 5
	contents (5, 2) := 1
	contents (7, 2) := 7

	contents (1, 3) := 7
	contents (3, 3) := 1
	contents (5, 3) := 6
	contents (7, 3) := 5

	contents (2, 4) := 2
	contents (4, 4) := 6
	contents (6, 4) := 1

	contents (2, 5) := 7
	contents (4, 5) := 5
	contents (6, 5) := 4

	contents (1, 6) := 1
	contents (3, 6) := 2
	contents (5, 6) := 2

	contents (3, 7) := 5
	contents (5, 7) := 6

	contents (4, 8) := 7

    elsif level = 6 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/royksopp - Remind Me.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground3.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (1, 1) := 7
	contents (2, 1) := 7
	contents (3, 1) := 2
	contents (4, 1) := 7
	contents (5, 1) := 6
	contents (6, 1) := 7
	contents (7, 1) := 5
	contents (8, 1) := 2

	contents (1, 2) := 2
	contents (3, 2) := 5
	contents (5, 2) := 7
	contents (7, 2) := 7

	contents (2, 3) := 5
	contents (3, 3) := 1
	contents (4, 3) := 7
	contents (5, 3) := 1
	contents (6, 3) := 6
	contents (7, 3) := 8

	contents (2, 4) := 2
	contents (4, 4) := 6
	contents (6, 4) := 7

	contents (2, 5) := 7
	contents (3, 5) := 8
	contents (4, 5) := 6
	contents (5, 5) := 6
	contents (6, 5) := 6
	contents (7, 5) := 7

	contents (1, 6) := 8
	contents (3, 6) := 1
	contents (5, 6) := 7
	contents (7, 6) := 7

	contents (1, 7) := 2
	contents (2, 7) := 8
	contents (3, 7) := 6
	contents (4, 7) := 6
	contents (5, 7) := 2
	contents (6, 7) := 1
	contents (7, 7) := 2
	contents (8, 7) := 5

    elsif level = 7 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/hellogoodbye - here (in your arms).mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground4.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (4, 1) := 7
	contents (5, 1) := 6

	contents (3, 2) := 2
	contents (4, 2) := 6
	contents (5, 2) := 2

	contents (4, 3) := 1
	contents (5, 3) := 6

	contents (2, 4) := 5
	contents (3, 4) := 6
	contents (5, 4) := 4
	contents (6, 4) := 6

	contents (2, 5) := 1
	contents (3, 5) := 4
	contents (4, 5) := 2
	contents (5, 5) := 1
	contents (6, 5) := 5
	contents (7, 5) := 5

	contents (2, 6) := 1
	contents (3, 6) := 2
	contents (5, 6) := 2
	contents (6, 6) := 1

    elsif level = 8 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/Techno - Sand Storm.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (1, 1) := 7
	contents (2, 1) := 2
	contents (3, 1) := 1
	contents (4, 1) := 6
	contents (5, 1) := 5
	contents (6, 1) := 8
	contents (7, 1) := 7
	contents (8, 1) := 2

	contents (1, 2) := 5
	contents (2, 2) := 8
	contents (3, 2) := 7
	contents (4, 2) := 2
	contents (5, 2) := 1
	contents (6, 2) := 6
	contents (7, 2) := 5

	contents (1, 3) := 7
	contents (2, 3) := 2
	contents (3, 3) := 1
	contents (4, 3) := 6
	contents (5, 3) := 5
	contents (6, 3) := 8
	contents (7, 3) := 7
	contents (8, 3) := 2

	contents (1, 4) := 5
	contents (2, 4) := 8
	contents (3, 4) := 7
	contents (4, 4) := 2
	contents (5, 4) := 1
	contents (6, 4) := 6
	contents (7, 4) := 5

    elsif level = 9 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/The Postal Service - Such Great Heights.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground2.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (1, 1) := 4
	contents (2, 1) := 4
	contents (3, 1) := 4
	contents (4, 1) := 4
	contents (5, 1) := 4
	contents (6, 1) := 4
	contents (7, 1) := 4
	contents (8, 1) := 4

	contents (1, 2) := 4
	contents (7, 2) := 4

	contents (1, 3) := 4
	contents (4, 3) := 5
	contents (5, 3) := 7
	contents (5, 3) := 7
	contents (6, 3) := 1
	contents (7, 3) := 5

	contents (1, 4) := 4
	contents (5, 4) := 3
	contents (6, 4) := 2
	contents (7, 4) := 3

	contents (1, 5) := 4
	contents (7, 5) := 6
	contents (8, 5) := 6

	contents (1, 6) := 1

	contents (1, 7) := 7
	contents (2, 7) := 7
	contents (3, 7) := 7
	contents (4, 7) := 7

	contents (1, 8) := 1
	contents (2, 8) := 1
	contents (3, 8) := 3
	contents (4, 8) := 2
	contents (5, 8) := 1

    elsif level = 10 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/royksopp - Remind Me.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground3.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (4, 1) := 7
	contents (5, 1) := 2

	contents (3, 2) := 2
	contents (4, 2) := 1
	contents (5, 2) := 7

	contents (3, 3) := 1
	contents (4, 3) := 7
	contents (5, 3) := 2
	contents (6, 3) := 1

	contents (2, 4) := 7
	contents (3, 4) := 2
	contents (4, 4) := 1
	contents (5, 4) := 7
	contents (6, 4) := 2

	contents (2, 5) := 2
	contents (3, 5) := 1
	contents (4, 5) := 7
	contents (5, 5) := 2
	contents (6, 5) := 1
	contents (7, 5) := 7

	contents (1, 6) := 1
	contents (2, 6) := 7
	contents (3, 6) := 2
	contents (4, 6) := 1
	contents (5, 6) := 7
	contents (6, 6) := 2
	contents (7, 6) := 1

	contents (1, 7) := 7
	contents (2, 7) := 2
	contents (3, 7) := 1
	contents (4, 7) := 7
	contents (5, 7) := 2
	contents (6, 7) := 1
	contents (7, 7) := 7
	contents (8, 7) := 2

    elsif level = 11 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/hellogoodbye - here (in your arms).mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground4.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (4, 1) := 3
	contents (5, 1) := 1

	contents (3, 2) := 6
	contents (4, 2) := 3
	contents (5, 2) := 1

	contents (3, 3) := 8
	contents (4, 3) := 8
	contents (5, 3) := 4
	contents (6, 3) := 7

	contents (2, 4) := 6
	contents (3, 4) := 1
	contents (4, 4) := 1
	contents (5, 4) := 1
	contents (6, 4) := 8

	contents (3, 5) := 1
	contents (4, 5) := 2
	contents (5, 5) := 6
	contents (6, 5) := 8

	contents (3, 6) := 2
	contents (4, 6) := 7
	contents (5, 6) := 4

	contents (4, 7) := 4
	contents (5, 7) := 1

	contents (4, 8) := 5

    elsif level = 12 then
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/Techno - Sand Storm.mp3")
	background := Pic.FileNew ("../turing_assets/levelbackground.bmp")
	Pic.Draw (background, 0, 0, picCopy)

	contents (1, 1) := 1
	contents (2, 1) := 1
	contents (3, 1) := 6
	contents (4, 1) := 7
	contents (5, 1) := 7
	contents (6, 1) := 6
	contents (7, 1) := 1
	contents (8, 1) := 1

	contents (1, 2) := 3
	contents (2, 2) := 1
	contents (3, 2) := 6
	contents (4, 2) := 7
	contents (5, 2) := 6
	contents (6, 2) := 1
	contents (7, 2) := 3

	contents (1, 3) := 2
	contents (2, 3) := 4
	contents (3, 3) := 1
	contents (4, 3) := 6
	contents (5, 3) := 6
	contents (6, 3) := 1
	contents (7, 3) := 2
	contents (8, 3) := 4

	contents (1, 4) := 4
	contents (2, 4) := 3
	contents (3, 4) := 1
	contents (4, 4) := 6
	contents (5, 4) := 1
	contents (6, 4) := 5
	contents (7, 4) := 8

	contents (1, 5) := 8
	contents (2, 5) := 3
	contents (3, 5) := 4
	contents (4, 5) := 1
	contents (5, 5) := 1
	contents (6, 5) := 2
	contents (7, 5) := 2
	contents (8, 5) := 8

	contents (1, 6) := 2
	contents (2, 6) := 8
	contents (3, 6) := 6
	contents (4, 6) := 1
	contents (5, 6) := 7
	contents (6, 6) := 4
	contents (7, 6) := 4


	contents (1, 7) := 2
	contents (2, 7) := 2
	contents (3, 7) := 8
	contents (4, 7) := 7
	contents (5, 7) := 6
	contents (6, 7) := 2
	contents (7, 7) := 4
	contents (8, 7) := 4

    elsif level = 13 then %level 13 is the game over screen for when you win
	Music.PlayFileStop
	Music.PlayFileLoop ("../music/Hot Hot Heat - Talk to Me, Dance with Me.mp3")

	loop
	    cls
	    Pic.Draw (gameoverscreen2, 0, 0, picCopy)
	    View.Update
	end loop
    end if

    for coloury : 1 .. 12 %draws the bubbles that are specified in each level
	for colourx : 1 .. 8
	    if contents (colourx, coloury) not= 0 then
		Pic.Draw (arrayofbubbles (contents (colourx, coloury)), xPos (colourx, coloury) - 16, yPos (colourx, coloury) - 16, picMerge)
		ballBackground := Pic.New (190, 90, 448, 404) %takes a picture of the bubbles
	    end if
	end for
    end for
end gameLevel

/* -----------------------------------------------------------------------
 This (gameOver) is a procedure to find out if you should lose a life or if its game
 over.
 ----------------------------------------------------------------------- */

proc gameOver (var contents : array 1 .. 8, 1 .. 12 of int)
    if lives = 1 then %if you lose now, its game over
	if contents (1, 12) not= 0 or %any balls in the bottom row
		contents (2, 12) not= 0 or
		contents (3, 12) not= 0 or
		contents (4, 12) not= 0 or
		contents (5, 12) not= 0 or
		contents (6, 12) not= 0 or
		contents (7, 12) not= 0 then

	    Music.PlayFileStop
	    Music.PlayFileLoop ("../music/Plain White T's.mp3")

	    loop
		cls
		Pic.Draw (gameoverscreen, 0, 0, picCopy) %game over screen (lose)
		View.Update
	    end loop
	end if
    else %more lives left
	if contents (1, 12) not= 0 or %any balls in the bottom row
		contents (2, 12) not= 0 or
		contents (3, 12) not= 0 or
		contents (4, 12) not= 0 or
		contents (5, 12) not= 0 or
		contents (6, 12) not= 0 or
		contents (7, 12) not= 0 then
	    lives -= 1 %lose a life if yes
	    gameLevel (contents) %restart level
	end if
    end if
end gameOver

/* -----------------------------------------------------------------------
 This (drawScene) is a procedure that draws the graphics of this game.
 ----------------------------------------------------------------------- */

proc drawScene (ang : real, x, y, vx, vy : real)
    Pic.Draw (background, 0, 0, picCopy)
    Pic.ScreenLoad ("../turing_assets/next.bmp", 225, 35, picMerge)
    Pic.Draw (ballBackground, 190, 90, picCopy)
    Pic.Draw (gunbase, maxx div 2 - 64, 0, picMerge)
    Pic.Draw (arrayofbubbles (spots (i + 1).c), maxx div 2 - 60, 0, picMerge) %preview ball
    Pic.ScreenLoad ("../turing_assets/man.bmp", 370, 0, picMerge)

    if lives = 3 then %displays how much life you have
	Pic.ScreenLoad ("../turing_assets/life3.bmp", 507, 415, picCopy)
    elsif lives = 2 then
	Pic.ScreenLoad ("../turing_assets/life2.bmp", 507, 416, picCopy)
    else
	Pic.ScreenLoad ("../turing_assets/life1.bmp", 507, 416, picCopy)
    end if
end drawScene

/* -----------------------------------------------------------------------
 This (trackInput) is a procedure that keeps track of what buttons are being
 pressed on the keyboard.
 ----------------------------------------------------------------------- */

proc trackInput (var ang : real, var shotFired : boolean)
    var chars : array char of boolean
    Input.KeyDown (chars)
    if chars (KEY_RIGHT_ARROW) then
	ang := max ((ang - 1), 30) %move ang
    elsif chars (KEY_LEFT_ARROW) then
	ang := min ((ang + 1), 150) %move ang
    end if
    if chars (' ') then
	shotFired := true
    end if
end trackInput

/* -----------------------------------------------------------------------
 This (vectorToXY) is a procedure that finds the vx and vy of the bubble
 that is about to fire using trig. The vx and vy are later added to x
 and y to make the bubble move.
 ----------------------------------------------------------------------- */

proc vectorToXY (ang : real, var vx, vy : real)
    vx := cosd (ang) * 6 %Constant Mag
    vy := sind (ang) * 6 %Constant Mag
end vectorToXY

/* -----------------------------------------------------------------------
 This (xyToVector) is a procedure that finds the direction (angle) of the bubble
 that is about to fire.
 ----------------------------------------------------------------------- */

proc xyToVector (var ang : real, x, y : real)
    ang := arcsind (y / 4)
end xyToVector

/* -----------------------------------------------------------------------
 This (wall) is a procedure that reverses the ball's vx so the ball bounces.
 ----------------------------------------------------------------------- */

proc wall (var vx : real)
    vx := vx * -1
end wall

/* -----------------------------------------------------------------------
 This (bubblesSpot) is a procedure that stores the position of the bubbles
 and moves to the next bubble. ****************
 ----------------------------------------------------------------------- */

proc bubbleSpot (var x, y : real)
    ballBackground := Pic.New (190, 90, 448, 404) %takes picture when bubble stops
    spots (i).x := spots (i).x %x position is stored
    spots (i).y := spots (i).y %y position is stored
    i += 1 %moves to the next ball and stops tracking the ball just shot
end bubbleSpot

/* -----------------------------------------------------------------------
 This (bubblesSpot) is a procedure snaps the bubble onto the closest position.
 ----------------------------------------------------------------------- */

proc bubbleSnap (var vx, vy : real, var contents, xPos, yPos : array 1 .. 8, 1 .. 12 of int)
    var closest : real := Math.Distance (spots (i).x + 16, spots (i).y + 16, xPos (8, 8), yPos (8, 8)) %we assign closest to the farthest point in the array
    var snapx : int %this will become the x coordinate the ball snaps to
    var snapy : int %this is the y coordinate it will snap to

    for y2 : 1 .. 12
	for x2 : 1 .. 8
	    if Math.Distance (spots (i).x + 16, spots (i).y + 16, xPos (x2, y2), yPos (x2, y2)) < closest and contents (x2, y2) = 0 then %nothing in ball and distance is shooter than closest
		closest := Math.Distance (spots (i).x + 16, spots (i).y + 16, xPos (x2, y2), yPos (x2, y2)) %keeps going until you find the closest distance
		snapx := xPos (x2, y2)
		snapy := yPos (x2, y2)
		coorx := x2
		coory := y2
	    end if
	end for
    end for

    contents (coorx, coory) := spots (i).c %stores the bubble
    spots (i).x := snapx
    spots (i).y := snapy
    Pic.Draw (arrayofbubbles (spots (i).c), round (spots (i).x) - 16, round (spots (i).y) - 16, picMerge)
end bubbleSnap

/* -----------------------------------------------------------------------
 This (drawNewBackground) is a procedure that draws the new background
 after the bubbles pop.
 ----------------------------------------------------------------------- */

proc drawNewBackground (var contents, xPos, yPos : array 1 .. 8, 1 .. 12 of int, coorx, coory : int)
    Pic.Draw (background, 0, 0, picCopy) %needed to take the picture for ballBackground

    for y2 : 1 .. 12
	for x2 : 1 .. 8
	    if contents (x2, y2) not= 0 then
		Pic.Draw (arrayofbubbles (contents (x2, y2)), xPos (x2, y2) - 16, yPos (x2, y2) - 16, picMerge)
	    end if
	end for
    end for
end drawNewBackground

/* -----------------------------------------------------------------------
 This (ballDrop) is a procedure that finds if the bubbles is no longer connected
 with the other bubbles. If this is true, then the ball disappears.
 ----------------------------------------------------------------------- */

proc ballDrop
    for y2 : 2 .. 12  %not include first layer because of the ceiling
	for x2 : 1 .. 8
	    if contents (x2, y2) > 0 then %a ball in the contents array
		if y2 mod 2 = 1 and x2 not= 1 and x2 not= 8 then %odd rows not including the sides
		    if contents (x2 - 1, y2 - 1) = 0 and contents (x2, y2 - 1) = 0 then
			contents (x2, y2) := 0
		    end if
		elsif y2 mod 2 not= 1 and x2 not= 1 and x2 not= 8 and x2 not= 7 then %even rows not including the sides
		    if contents (x2, y2 - 1) = 0 and contents (x2 + 1, y2 - 1) = 0 then
			contents (x2, y2) := 0
		    end if
		elsif y2 mod 2 = 1 and x2 = 1 then
		    if contents (x2, y2 - 1) = 0 and contents (x2 + 1, y2) = 0 then
			contents (x2, y2) := 0
		    end if
		elsif y2 mod 2 = 1 and x2 = 8 then
		    if contents (x2 - 1, y2 - 1) = 0 and contents (x2 - 1, y2) = 0 then
			contents (x2, y2) := 0
		    end if
		elsif y2 mod 2 not= 1 and x2 = 1 then
		    if contents (x2, y2 - 1) = 0 and contents (x2 + 1, y2 - 1) = 0 and contents (x2 + 1, y2) = 0 then
			contents (x2, y2) := 0
		    end if
		elsif y2 mod 2 not= 1 and x2 = 7 then
		    if contents (x2 + 1, y2 - 1) = 0 and contents (x2, y2 - 1) = 0 and contents (x2 - 1, y2) = 0 then
			contents (x2, y2) := 0
		    end if
		end if
	    end if
	end for
    end for

    drawNewBackground (contents, xPos, yPos, coorx, coory)
end ballDrop

/* -----------------------------------------------------------------------
 This (colourCheck) is a very important procedure. This procedure makes
 the bubbles disappear when the bubbles are connected in a group larger or
 equal to 3.
 ----------------------------------------------------------------------- */

proc colourCheck (var contents : array 1 .. 8, 1 .. 12 of int, coorx, coory : int)
    if colourCount >= 3 then

	if coory mod 2 = 1 then %odd rows
	    if coorx not= 1 and coorx not= 8 and coory = 1 then %ceiling but not the top corners
		if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then %special case
		    colourCheck (contents, coorx + 1, coory)
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		else     %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx = 1 and coory = 1 then %top left corner
		if contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx = 8 and coory = 1 then %top right corner
		if contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory + 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx not= 1 and coorx not= 8 and coory not= 1 then %not corners on odd row
		if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then
		    colourCheck (contents, coorx + 1, coory)
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) and contents (coorx, coory) = contents (coorx, coory - 1) then
		    colourCheck (contents, coorx - 1, coory)
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		    colourCheck (contents, coorx - 1, coory - 1)
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) and contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    colourCheck (contents, coorx - 1, coory - 1)
		    colourCheck (contents, coorx - 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		    colourCheck (contents, coorx - 1, coory - 1)
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx - 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory - 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx = 1 then %left side
		if contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx = 8 then %right side
		if contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory - 1)
		elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory + 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    end if
	else  %even rows
	    if coorx = 1 then %left side on even rows (very similar to coorx = 7 expect the first line under this line)

		if contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    colourCheck (contents, coorx, coory + 1)
		    colourCheck (contents, coorx + 1, coory - 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory - 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    elsif coorx = 7 then %right side on even rows
		if contents (coorx, coory) = contents (coorx + 1, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coorx + 1) then
		    colourCheck (contents, coorx + 1, coory - 1)
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory - 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory + 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    else %regular ones in the middle
		if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then
		    colourCheck (contents, coorx - 1, coory)
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    colourCheck (contents, coorx + 1, coory - 1)
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx, coory - 1) then
		    colourCheck (contents, coorx + 1, coory)
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    colourCheck (contents, coorx + 1, coory - 1)
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    colourCheck (contents, coorx, coory - 1)
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory)
		elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx - 1, coory)
		elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory + 1)
		elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx, coory - 1)
		elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		    contents (coorx, coory) := 0
		    colourCheck (contents, coorx + 1, coory - 1)
		else %no balls anywhere
		    contents (coorx, coory) := 0
		end if
	    end if
	end if
	ballDrop %checks if any other balls should disappear
	drawNewBackground (contents, xPos, yPos, coorx, coory) %draws new background without the bubbles that are suppose to disappear
	colourCount := 1 %colourCount returns to 1
    end if
end colourCheck

/* -----------------------------------------------------------------------
 This (colourCountCheck) is a procedure that finds if the bubbles are in
 a group of 3 or more.
 ----------------------------------------------------------------------- */

proc colourCountCheck (var contents : array 1 .. 8, 1 .. 12 of int, coorx, coory : int)
    var trackIf : boolean := false %used to check if it runs through the cases
    var tempColour := contents (coorx, coory) %stores the colour

    gameOver (contents)

    if coory = 12 then
	drawNewBackground (contents, xPos, yPos, coorx, coory)
	colourCount := 1
    elsif coory mod 2 = 1 then %odd rows
	if coorx not= 1 and coorx not= 8 and coory = 1 then %ceiling but not the top corners
	    if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then %special case
		contents (coorx, coory) := 9 %9 is a randomly chosen number to replace the original colour to avoid an error when using recurssion
		colourCount += 2 %two bubbles are touching
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx = 1 and coory = 1 then %top left corner
	    if contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx = 8 and coory = 1 then %top right corner
	    if contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx not= 1 and coorx not= 8 and coory not= 1 then %not corners on odd row
	    if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) and contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) and contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory - 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx = 1 then %left side
	    if contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx = 8 then %right side
	    if contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	end if
    else %even rows
	if coorx = 1 then %left side on even rows (very similar to coorx = 7 expect the first line under this line)
	    if contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory - 1)
		colourCount += 1
		trackIf := true
	    end if
	elsif coorx = 7 then %right side on even rows
	    if contents (coorx, coory) = contents (coorx + 1, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coorx + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory + 1)
		colourCount += 1
		trackIf := true
	    end if
	else %regular ones in the middle
	    if contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) and contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) and contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) and contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCount += 2
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx - 1, coory) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx - 1, coory)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory + 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory + 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx, coory - 1)
		colourCount += 1
		trackIf := true
	    elsif contents (coorx, coory) = contents (coorx + 1, coory - 1) then
		contents (coorx, coory) := 9
		colourCountCheck (contents, coorx + 1, coory - 1)
		colourCount += 1
		trackIf := true
	    end if
	end if
    end if

    if trackIf = false then %if it doesn't run through any of these cases
	colourCount := 1
    end if

    for y2 : 1 .. 12
	for x2 : 1 .. 8
	    if contents (x2, y2) = 9 then
		contents (x2, y2) := tempColour %puts back the original colour
	    end if
	end for
    end for
end colourCountCheck

/* -----------------------------------------------------------------------
 This (ceiling) is a procedure that stops the bubble when it reaches
 the ceiling.
 ----------------------------------------------------------------------- */

proc ceiling (var vx, vy : real)
    vx := 0
    vy := 0
    bubbleSnap (vx, vy, contents, xPos, yPos) %snaps bubble to proper position
    colourCountCheck (contents, coorx, coory) %runs if the bubble is in a group
    colourCheck (contents, coorx, coory) %deletes them if they are in a group
end ceiling

/* -----------------------------------------------------------------------
 This (ballDistance) is a procedure that stops the bubble when it touches
 another bubble
 ----------------------------------------------------------------------- */

proc ballDistance (var vx, vy : real)
    for x2 : 1 .. 8 %goes through each spot
	for y2 : 1 .. 12
	    if Math.Distance (spots (i).x + 16, spots (i).y + 16, xPos (x2, y2), yPos (x2, y2)) <= 35 and contents (x2, y2) not= 0 then %if balls are touching
		drawScene (ang, spots (i).x, spots (i).y, vx, vy)
		ceiling (vx, vy) %stops the ball
		bubbleSpot (spots (i).x, spots (i).y)
		shotLive := false
		shotFired := false
	    end if
	end for
    end for
end ballDistance

/* -----------------------------------------------------------------------
 This (newLevel) is a procedure that determines if the level is finished
 ----------------------------------------------------------------------- */

proc newLevel (var contents : array 1 .. 8, 1 .. 12 of int)
    var ballcounter : int := 0 %check how many bubbles are on the screen

    for y2 : 1 .. 12
	for x2 : 1 .. 8
	    if contents (x2, y2) > 0 then
		ballcounter += 1
	    end if
	end for
    end for

    if ballcounter = 0 then %if no bubbles then move to next level
	level += 1
	gameLevel (contents)
    end if
end newLevel

%Draws the first background

Pic.Draw (background, 0, 0, picCopy) %draws background
ballBackground := Pic.New (190, 90, 448, 404) %background of where the bubbles land
Pic.Draw (ballBackground, 190, 90, picCopy)

loop
    trackInput (ang, shotFired) %see if any buttons are being pressed
    if shotFired = true and not shotLive then %if space is pressed and bubbles are not moving
	vectorToXY (ang, vx, vy)
	shotLive := true %bubble is now moving
	shotFired := false
    end if
    if shotLive = true then
	spots (i).x += vx %add vx and vy to move the bubble
	spots (i).y += vy
	ballDistance (vx, vy) %checks if the bubble needs to be stopped
	if spots (i).x <= maxx - 450 or spots (i).x >= maxx - 220 then
	    wall (vx) %if it touches the wall, then bounce
	end if
	if spots (i).y >= maxy - 80 then %if bubble reaches the ceiling
	    drawScene (ang, spots (i).x, spots (i).y, vx, vy) %drawsScene so the shooter with not be in the picture of ballBackground
	    ballBackground := Pic.New (190, 90, 448, 404) %takes picture when ball touches ceiling
	    shotLive := false
	    ceiling (vx, vy)
	    bubbleSpot (spots (i).x, spots (i).y)
	    shotFired := false
	end if
    end if

    drawScene (ang, spots (i).x, spots (i).y, vx, vy) %the shooter is not in the drawScene so the ballBackground will not take the picture of the shooter
    newLevel (contents) %upload level
    Pic.Draw (shooterang (round (ang)), maxx div 2 - (130 div 2), 0, picMerge) %draws the shooter
    Pic.Draw (arrayofbubbles (spots (i).c), round (spots (i).x), round (spots (i).y), picMerge) %draws the bubble that is being tracked
    View.Update
end loop
