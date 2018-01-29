/**
 * The MIT License
 * 
 * Copyright 2018 Pierre-Loic DOULCET
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

function WardleyMap(params) {

    this.binImage = new Image();
    this.binImage.src  = "/img/bin.png";
    this.target = document.querySelector(params.target) || document.body;
    this.width = this.target.offsetWidth;
    this.height = this.target.offsetHeight;

    this.data = params.data || { id: 'newMap' ,title: "Map title", elements: [], links : [], arrows : []};



    
    this.maxId = this.data.elements.length;

    this.setTitle = function(title) {
        this.data.title = title;
    }

    this.init = function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.target.innerHTML = "";
        this.target.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('title').innerHTML = this.data.title;
        
        this.render();

        this.bindEvents();
        
    }

    this.render = function() {

        // Responsive magic
        if (this.target.offsetWidth != this.width || this.height != this.target.offsetHeight) {
            this.width = this.target.offsetWidth;
            this.height = this.target.offsetHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
        }

        var ctx = this.ctx;
        ctx.clearRect(0,0,this.width, this.height);

        this.recalculate();
        this.renderGizmo();

        this.renderLinks();
        this.renderArrows();
        this.renderCircles();
    }

    this.recalculate = function() {
        for (var i = 0;  this.data.elements && i < this.data.elements.length; ++i) {
            var element = this.data.elements[i];

            element.x = this.per2x(element.maturity);
            element.y = this.per2y(element.visibility);
        }
        for (var i = 0; this.data.arrows && i < this.data.arrows.length; ++i) {
            var arrow = this.data.arrows[i];

            arrow.x = this.per2x(arrow.maturity);
            arrow.y = this.per2y(arrow.visibility);
        }
    }


    


    this.renderGizmo = function() {
        var ctx = this.ctx;

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath()
        ctx.moveTo(10, 5);
        ctx.lineTo(10, this.height - 10);
        ctx.lineTo(this.width - 5, this.height - 10);
        ctx.stroke();

        ctx.fillStyle = '#444';
        this.drawArrowhead({x : 10, y : 50}, {x : 10, y : 5}, 5);

        this.drawArrowhead({x : 10, y : this.height - 10}, {x : this.width - 5, y : this.height - 10}, 5);

        var step = (this.width - 10) / 4 | 0;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(step, 0);
        ctx.lineTo(step, this.height - 10);
        ctx.moveTo(step * 2, 0);
        ctx.lineTo(step * 2, this.height - 10);
        ctx.moveTo(step * 3, 0);
        ctx.lineTo(step * 3, this.height - 10);
        ctx.setLineDash([4,5]);
        ctx.stroke();
        ctx.setLineDash([]);


        // labels
        ctx.textAlign="center"; 
        
        ctx.fillStyle = "#aaa";
        ctx.font = "17px times new roman"
        ctx.fillText("Genesis", step / 2 + 10,  this.height - 15);
        ctx.fillText("Custom", step +  step / 2 + 10,  this.height - 15);
        ctx.fillText("Product", 2 * step +  step / 2 + 10,  this.height - 15);
        ctx.fillText("Commodity", 3 * step +  step / 2 + 10,  this.height - 15);


        ctx.textAlign="start"; 
        if (this.selectedElement || this.targetElement4ArrowHead) {
            ctx.globalAlpha = 0.4;
            ctx.drawImage(this.binImage, this.width - 80, 10, 70,70);
            ctx.globalAlpha = 1.0;
            if (this.selectedElement && this.selectedElement.x > this.width - 80 && this.selectedElement.x < this.width - 10 && this.selectedElement.y > 10 && this.selectedElement.y < 80) {
                ctx.drawImage(this.binImage, this.width - 80, 10, 70,70);
            }
            if ( this.targetElement4ArrowHead && this.targetElement4ArrowHead.x > this.width - 80 && this.targetElement4ArrowHead.x < this.width - 10 && this.targetElement4ArrowHead.y > 10 && this.targetElement4ArrowHead.y < 80) {
                ctx.drawImage(this.binImage, this.width - 80, 10, 70,70);
            }
        }
    }


    this.renderLinks = function(){
        var ctx = this.ctx;
        var elementsIndex = {};
        ctx.strokeStyle = '#444';
        for (var i = 0; i < this.data.elements.length; ++i) {
            elementsIndex[this.data.elements[i].id] = this.data.elements[i];
        }

        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i < this.data.links.length; ++i) {
            var link = this.data.links[i];
            
            ctx.moveTo(
                elementsIndex[link.start].x ,
                elementsIndex[link.start].y
            );
            ctx.lineTo(
                elementsIndex[link.end].x ,
                elementsIndex[link.end].y
            );
        }

        ctx.stroke();
    }

    this.renderArrows = function(){
        var ctx = this.ctx;
        var elementsIndex = {};

        for (var i = 0; i < this.data.elements.length; ++i) {
            elementsIndex[this.data.elements[i].id] = this.data.elements[i];
        }

        
        ctx.strokeStyle = '#DD4444';
        ctx.fillStyle = '#DD4444';       
        for (var i = 0; this.data.arrows && i < this.data.arrows.length; ++i) {
            var arrow = this.data.arrows[i];
            
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(
                elementsIndex[arrow.from].x ,
                elementsIndex[arrow.from].y
            );
            ctx.lineTo(
                this.per2x(arrow.maturity) ,
                this.per2y(arrow.visibility)
            );

            ctx.stroke();
            this.drawArrowhead(
                elementsIndex[arrow.from], 
                arrow
                , 10
            );
        }

        
    }

    this.renderCircles = function() {
        var ctx = this.ctx;

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = '#444';
        for (var i = 0; i < this.data.elements.length; ++i) {
            var circle = this.data.elements[i];
            
            if (circle.id > this.maxId) {
                this.maxId = circle.id;
            }

            ctx.moveTo(
                circle.x + 10,
                circle.y
            );

            ctx.arc(
                circle.x,
                circle.y,
                10,
                0,
                Math.PI * 2,
                true
            );

        }

        ctx.fill();
        ctx.stroke();

        
        ctx.font = "15px times new roman";
        for (var i = 0; i < this.data.elements.length; ++i) {

            var circle = this.data.elements[i];


            var txtSize = ctx.measureText(circle.name);
            circle.tx = circle.x + 10;
            circle.ty = circle.y - 16;
            circle.txe = circle.x + 10 + txtSize.width + 10;
            circle.tye = circle.y - 16 + 21;

            ctx.fillStyle = "#fff";
            ctx.globalAlpha = .5;
            ctx.fillRect( 
                circle.x + 10,
                circle.y - 16, 
                txtSize.width + 10,
                21 
            );
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#000";
            ctx.fillText(
                circle.name,
                circle.x + 15,
                circle.y
            )
            

        }
        
    }


    this.bindEvents = function() {
        this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseStop.bind(this));
        this.canvas.addEventListener('mouseout', this.mouseStop.bind(this));
    }


 
    this._editBinded = false;
    this.edittext = function(element) {
        this.__futurEditElement = element;
        // mapping.guru specific to delete
        if ($ && $('#editNodeModal')) {
            $('#editNodeModal').modal();
            $('#editNodeName').val(element.name);
    
            // on enter
            if (!this._editBinded) {
                this._editBinded  = true;
    
                $('#editNodeName').on('keyup', function (e) {
                    if (e.keyCode == 13) {
                        this.doEditNode();
                    }
                }.bind(this));
            }
        }
        else {
            this.__futurEditElement.name = prompt('Node Name ?', this.__futurEditElement.name) || this.__futurEditElement.name;
        }
        
       
        
    }

    this.doEditNode = function() {
        this.__futurEditElement.name =  $('#editNodeName').val() || this.__futurEditElement.name;
    }

    this._createBinded = false;
    this.createCircle = function(x, y) {

        this.__futurNode = {
            x : this.x2per(x), y :this.y2per(y)
        }
        // mapping.guru specific to delete
        if ($ && $('#newNodeModal')) {
            $('#newNodeModal').modal();
            $('#newNodeName').val("");

            // on enter
            if (!this._createBinded) {
                this._createBinded = true;
                $('#newNodeName').on('keyup', function (e) {
                    if (e.keyCode == 13) {
                    this.createCircleFromName();
                    }
                }.bind(this));
            }
        }
        else {
            var nodeName = prompt('node name?');
            if (!nodeName) {
                return;
            }
            this.data.elements.push({
                maturity :  this.__futurNode.x ,
                visibility :  this.__futurNode.y,
                name : nodeName,
                id : ++this.maxId
            });
            this.render();
        }

    }

    this.createCircleFromName = function() {
        var name = $('#newNodeName').val();
        if (!name) {
            return;
        }
        this.data.elements.push({
            maturity :  this.__futurNode.x ,
            visibility :  this.__futurNode.y,
            name : name,
            id : ++this.maxId
        });
        $('#newNodeModal').modal('hide');
        this.render();
    }

    this.drawArrowhead =function(from, to, radius) {
        var x_center = to.x;
        var y_center = to.y;

        var angle;
        var x;
        var y;
        var ctx = this.ctx;
        
        ctx.beginPath();
        angle = Math.atan2(to.y - from.y, to.x - from.x)
        x = radius * Math.cos(angle) + x_center;
        y = radius * Math.sin(angle) + y_center;

        ctx.moveTo(x, y);

        angle += (1.0/3.0) * (2 * Math.PI)
        x = radius * Math.cos(angle) + x_center;
        y = radius * Math.sin(angle) + y_center;

        ctx.lineTo(x, y);

        angle += (1.0/3.0) * (2 * Math.PI)
        x = radius *Math.cos(angle) + x_center;
        y = radius *Math.sin(angle) + y_center;

        ctx.lineTo(x, y);

        ctx.closePath();

        ctx.fill();
    }

    this.mouseDown = function(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        
        var targetElement = null;
        for (var  i = 0; i < this.data.elements.length; ++i) {
            var element =  this.data.elements[i];

            if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 10) {
                targetElement = element;
            }
        }


        if (targetElement) {
            this.selectedElement = targetElement;
            return;
        }


        var targetElement4Link = null;
        for (var  i = 0; i < this.data.elements.length; ++i) {
            var element =  this.data.elements[i];

            if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 18) {
                targetElement4Link = element;
            }
        }

        if (targetElement4Link) {
            // click on link tool
            // console.log('TARGET', targetElement4Link)
            if (event.shiftKey) {
                this.targetElement4Arrow = targetElement4Link; 
            }
            else {
                this.targetElement4Link = targetElement4Link;
            }
            
            return;
        }

        var targetElement4Text = null;
        for (var  i = 0; i < this.data.elements.length; ++i) {
            var element =  this.data.elements[i];

            if (x > element.tx && x < element.txe && y > element.ty && y < element.tye) {
                this.edittext(element);
                return;
            }
        }

        var targetElement4ArrowHead = null;
        for (var  i = 0; this.data.arrows && i < this.data.arrows.length; ++i) {
            var arrow =  this.data.arrows[i];

            if (Math.sqrt((x - arrow.x) * (x - arrow.x) + (y - arrow.y) * (y - arrow.y)) < 10) {
                targetElement4ArrowHead = arrow;
            }
        }
        if (targetElement4ArrowHead) {
          this.targetElement4ArrowHead = targetElement4ArrowHead;
          return;
        }

        this.createCircle(x, y);

    }

    this.mouseMove = function(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var ctx = this.ctx;

        if (this.selectedElement) {

            this.selectedElement.maturity =  this.x2per(event.offsetX);
            this.selectedElement.visibility = this.y2per(event.offsetY);

            this.render();
        }

        else if (this.targetElement4Link) {
            this.render();
            
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#44DD44';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(this.targetElement4Link.x, this.targetElement4Link.y);
            ctx.lineTo(event.offsetX, event.offsetY)
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.targetElement4Link.x + 10, this.targetElement4Link.y);
            ctx.arc(this.targetElement4Link.x, this.targetElement4Link.y, 10, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();

                
            var targetElement = null;
            for (var  i = 0; i < this.data.elements.length; ++i) {
                var element =  this.data.elements[i];

                if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 10) {
                    targetElement = element;
                }
            }

            if (targetElement) {
                ctx.beginPath();
                ctx.moveTo(targetElement.x + 10, targetElement.y);
                ctx.arc(targetElement.x, targetElement.y, 10, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();
            }
        }
        else if (this.targetElement4Arrow) {
            this.render();
            
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#DD4444';
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(this.targetElement4Arrow.x, this.targetElement4Arrow.y);
            ctx.lineTo(event.offsetX, event.offsetY)
            ctx.stroke();

            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.targetElement4Arrow.x + 10, this.targetElement4Arrow.y);
            ctx.arc(this.targetElement4Arrow.x, this.targetElement4Arrow.y, 10, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#DD4444';
            this.drawArrowhead(this.targetElement4Arrow, {x: x, y: y}, 10)
        }
        else if(this.targetElement4ArrowHead) {
            this.targetElement4ArrowHead.maturity = this.x2per(x);
            this.targetElement4ArrowHead.visibility = this.y2per(y);
            this.render();
        }
        // sign
        else {
            if (this.shouldRender) {
                this.render();
            }
            var targetElement = null;
            for (var  i = 0; i < this.data.elements.length; ++i) {
                var element =  this.data.elements[i];

                if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 10) {
                    targetElement = element;
                }
            }
            // Move Sign
            if (targetElement) {
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#00000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(targetElement.x + 10, targetElement.y);
                ctx.arc(targetElement.x, targetElement.y, 10, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();
                this.shouldRender = true;
            }
            else {
                // Link Sign
                for (var  i = 0; i < this.data.elements.length; ++i) {
                    var element =  this.data.elements[i];

                    if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 18) {
                        targetElement = element;
                    }
                }
                if (targetElement) {
                
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = '#44DD44';
                    if (event.shiftKey) {
                        ctx.strokeStyle = '#DD4444';
                    }
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(targetElement.x + 10, targetElement.y);
                    ctx.arc(targetElement.x, targetElement.y, 10, 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.stroke();
                    this.shouldRender = true;
                }
            }
        }
    }

    this.mouseStop  = function(event) {
        
        var x = event.offsetX;
        var y = event.offsetY;

        if (this.targetElement4Link) {
            var targetElement = null;
            for (var  i = 0; i < this.data.elements.length; ++i) {
                var element =  this.data.elements[i];

                if (Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y)) < 10) {
                    targetElement = element;
                }
            }

            if (targetElement && targetElement.id != this.targetElement4Link.id) {
                
                var start = this.targetElement4Link.id;
                var end = targetElement.id;

                // flag to prevent duplication of links
                var canInsert = true;
                for (var i = 0; canInsert && i < this.data.links.length; ++i) {
                    var link = this.data.links[i];
                    if (link.start == start && link.end == end) {
                        canInsert = false;
                    }
                    if (link.end == start && link.start == end) {
                        canInsert = false;
                    }
                }

                if (canInsert) {
                    this.data.links.push({
                        start : start,
                        end : end
                    })
                }
            }
        }
        
        if (this.selectedElement) {
            // bin position : this.width - 80, 10, 70,70
            if (x > this.width - 80 && x < this.width - 10 && y > 10 && y < 80) {
                // delete!
                var toDeleteId = this.selectedElement.id;
                for (var i = 0; i < this.data.elements.length; ++i) {
                    if (this.data.elements[i].id == toDeleteId) {
                        this.data.elements.splice(i, 1);
                        break;
                    }
                }

                for (var i = 0; i < this.data.links.length; ++i) {
                    if (this.data.links[i].end == toDeleteId || this.data.links[i].start == toDeleteId ) {
                        this.data.links.splice(i--, 1);
                    }
                }
                for (var i = 0; i < this.data.arrows.length; ++i) {
                    if (this.data.arrows[i].from == toDeleteId) {
                        this.data.arrows.splice(i--, 1);
                    }
                }
            }
        }

        if (this.targetElement4Arrow) {
            if (!this.data.arrows) {
                this.data.arrows = [];
            }
            this.data.arrows.push({
                from : this.targetElement4Arrow.id,
                maturity : this.x2per(x),
                visibility : this.y2per(y)
            });
        }

        if (this.targetElement4ArrowHead) {
            this.targetElement4ArrowHead.maturity = this.x2per(x)
            this.targetElement4ArrowHead.visibility = this.y2per(y);

            if (x > this.width - 80 && x < this.width - 10 && y > 10 && y < 80) {
                // delete!
              
                for (var i = 0; i < this.data.arrows.length; ++i) {
                    if (this.data.arrows[i] == this.targetElement4ArrowHead) {
                        this.data.arrows.splice(i, 1);
                        break;
                    }
                }
            }
        }


        this.selectedElement = null;
        this.targetElement4Link = null;
        this.targetElement4Arrow = null;
        this.targetElement4ArrowHead = null;
        this.render();
    }


    /*helperfunction*/

    this.per2x = function(per) {
        return  10 + per * (this.width - 10);
    }

    this.per2y = function(per) {
        return (1 - per) * (this.height - 10)
    }


    this.x2per = function(x) {
        return  (x-  10) / (this.width - 10);
    }

    this.y2per = function(y) {
        return  1 - (y / (this.height - 10));
    }

    this.init();
}





