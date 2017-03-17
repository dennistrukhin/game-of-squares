/*jslint browser: true */
/*global $, app*/
window.app = {
    
    consts: {
        square: {
            borderPercentage: 0.07
        }
    },
    
    state: {
        active: false,
        levelNumber: 1,
        height: 0,
        width: 0,
        square: {
            total: 0,
            body: 0,
            borderTotal: 0,
            border: 0,
            margin: 0
        },
        dragDropObject: undefined,
        dragDropStart: 0
    },
    
    level: {
        caption: '',
        description: '',
        field: {
            width: 0,
            height: 0,
            controls: {},
            data: []
        },
        
        load: function () {
            'use strict';
            $('.content .field').remove();
            app.level.field.data = [];
            app.level.field.controls = {
                t: [],
                b: [],
                l: [],
                r: []
            };
            try {
                var difficulty = Math.floor($('#game-difficulty').attr('data-position') / 226 * 40 + 4),
                    d = 0,
                    row = 0,
                    column = 0,
                    action = 0,
                    i = 0,
                    c = 0,
                    r = 0;
                app.level.field.width = Math.floor($('#game-field-size').attr('data-position') / 226 * 7 + 5); // 5 - 12
                app.level.field.height = Math.floor($('#game-field-size').attr('data-position') / 226 * 5 + 4); // 4 - 9
                for (row = 0; row < app.level.field.height; row += 1) {
                    app.level.field.data.push([]);
                    for (column = 0; column < app.level.field.width; column += 1) {
                        action = Math.floor(Math.random() * 7);
                        if (action === 3 && app.level.field.height < 5) {
                            action = 1;
                        }
                        app.level.field.data[row].push([]);
                        app.level.field.data[row][column] = {
                            s: 0,
                            t: 0,
                            a: action,
                            e: 0
                        };
                    }
                }
                d = {
                    'width': ['t', 'b'],
                    'height': ['l', 'r']
                };
                $.each(d, function (direction, controls) {
                    $.each(controls, function (index, controlPosition) {
                        for (i = 0; i < app.level.field[direction]; i += 1) {
                            if (app.level.field.controls[controlPosition].length === 0 || app.level.field.controls[controlPosition][i - 1] !== 2) {
                                r = Math.random();
                                app.level.field.controls[controlPosition].push(r < 0.3 ? ((r < 0.1 && i + 1 < app.level.field[direction]) ? 2 : 1) : 0);
                            } else {
                                app.level.field.controls[controlPosition].push(0);
                            }
                        }
                    });
                });

                app.level.start();
                
                for (i = 0, d = Math.floor($('#game-difficulty').attr('data-position') / 226 * 40 + 2); i <= d; i += 1) {
                    c = Math.floor(Math.random() * app.level.field.width + 1);
                    r = Math.floor(Math.random() * app.level.field.height + 1);
                    $('.content .field .square.c' + c + '.r' + r).trigger('click', [false]);
                    $('.content .field .square.c' + c + '.r' + r).trigger('click', [false]);
                }
         
            } catch (e) {
                window.alert('ERROR: ' + e.message);
            }
        },
        
        start: function () {
            'use strict';
            $('.content .intro').remove();
            $('.content').append("<div class='field'></div>");
            
            var offsetV = app.level.field.controls.t.length > 0 ? 1 : 0,
                offsetH = app.level.field.controls.l.length > 0 ? 1 : 0;
            $.each(app.level.field.data, function (rowNumber, rowData) {
                $.each(rowData, function (columnNumber, item) {
                    $('.content .field').append("<div class='square r" + (rowNumber + 1) + " c" + (columnNumber + 1) +
                                                "' data-row='" + (rowNumber + 1) + "' data-column='" + (columnNumber + 1) +
                                                "' data-state='" + item.s + "' data-type='" + item.t +
                                                "' data-action='" + item.a + "' data-end='" + item.e +
                                                "'><div class='inner'></div></div>");
                });
            });
            $.each(['t', 'b', 'l', 'r'], function (i, position) {
                $.each(app.level.field.controls[position], function (index, control) {
                    if (control !== 0) {
                        var rowNumber = 0,
                            columnNumber = 0;
                        switch (position) {
                        case 't':
                            rowNumber = 0;
                            columnNumber = index + 1;
                            break;
                        case 'b':
                            rowNumber = 0;
                            columnNumber = index + 1;
                            break;
                        case 'l':
                            rowNumber = index + 1;
                            columnNumber = 0;
                            break;
                        case 'r':
                            rowNumber = index + 1;
                            columnNumber = 0;
                            break;
                        }
                                
                        $('.content .field').append("<div class='control " + position +
                                                    " r" + rowNumber + " c" + columnNumber +
                                                    " a" + control + "' data-row='" + rowNumber + "' data-column='" +
                                                    columnNumber + "' data-action='" + control + "' data-position='" + position +
                                                    "'><div class='inner'></div></div>");
                    }
                });
            });
            app.rebuildInterface();
            app.state.active = true;
        },
        
        checkFinish: function () {
            'use strict';
            $('.content .field .square').each(function (index, square) {
                if ($(square).attr('data-state') !== $(square).attr('data-end')) {
                    return false;
                }
            });
            return true;
        }
    },
    
    squares: {
        
        getNeighbours: function (handler) {
            'use strict';
            var neighbours = [],
                x = parseInt($(handler).attr('data-column'), 10),
                y = parseInt($(handler).attr('data-row'), 10);
            switch ($(handler).attr('data-action')) {
            case '0':
                break;
            case '1':
                neighbours.push($('.content .field .square.r' + y + '.c' + (x > 1 ? x - 1 : app.level.field.width)));
                neighbours.push($('.content .field .square.r' + y + '.c' + (x < window.app.level.field.width ? (x + 1) : 1)));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y > 1 ? y - 1 : app.level.field.height)));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y < app.level.field.height ? y + 1 : 1)));
                break;
            case '2':
                neighbours.push($('.content .field .square.r' + (y > 1 ? y - 1 : app.level.field.height) + '.c' + (x > 1 ? x - 1 : app.level.field.width)));
                neighbours.push($('.content .field .square.r' + (y > 1 ? y - 1 : app.level.field.height) + '.c' + (x < window.app.level.field.width ? (x + 1) : 1)));
                neighbours.push($('.content .field .square.r' + (y < app.level.field.height ? y + 1 : 1) + '.c' + (x > 1 ? x - 1 : app.level.field.width)));
                neighbours.push($('.content .field .square.r' + (y < app.level.field.height ? y + 1 : 1) + '.c' + (x < window.app.level.field.width ? (x + 1) : 1)));
                break;
            case '3':
                neighbours.push($('.content .field .square.r' + y + '.c' + (x > 1 ? x - 1 : app.level.field.width)));
                neighbours.push($('.content .field .square.r' + y + '.c' + (x < window.app.level.field.width ? (x + 1) : 1)));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y > 1 ? y - 1 : app.level.field.height)));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y < app.level.field.height ? y + 1 : 1)));
                    
                neighbours.push($('.content .field .square.r' + y + '.c' + (x > 2 ? x - 2 : (app.level.field.width + x - 2))));
                neighbours.push($('.content .field .square.r' + y + '.c' + (x < window.app.level.field.width - 1 ? x + 2 : (2 - window.app.level.field.width + x))));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y > 2 ? y - 2 : (app.level.field.height + y - 2))));
                neighbours.push($('.content .field .square.c' + x + '.r' + (y < app.level.field.height - 1 ? y + 2 : (2 - app.level.field.height + y))));
                break;
            case '4':
                $('.content .field .square.r' + y).each(function (index, square) {
                    if (parseInt($(square).attr('data-column'), 10) !== x) {
                        neighbours.push($(square));
                    }
                });
                break;
            case '5':
                $('.content .field .square.c' + x).each(function (index, square) {
                    if (parseInt($(square).attr('data-row'), 10) !== y) {
                        neighbours.push($(square));
                    }
                });
                break;
            case '6':
                $('.content .field .square.r' + y).each(function (index, square) {
                    if (parseInt($(square).attr('data-column'), 10) !== x) {
                        neighbours.push($(square));
                    }
                });
                $('.content .field .square.c' + x).each(function (index, square) {
                    if (parseInt($(square).attr('data-row'), 10) !== y) {
                        neighbours.push($(square));
                    }
                });
                break;
            }
            return neighbours;
        },
        
        switchNeighbours: function (handler, withAnimation) {
            'use strict';
            switch ($(handler).attr('data-action')) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                $.each(app.squares.getNeighbours($(handler)), function (index, square) {
                    var newState = parseInt($(square).attr('data-state'), 10) < window.data.types['t' + $(square).attr('data-type')].length - 1 ? parseInt($(square).attr('data-state'), 10) + 1 : 0;
                    //window.alert(newState);
                    $(square).attr('data-state', newState);
                    if (withAnimation) {
                        $(square).find('.inner').animate({'background-color': window.data.types['t' + $(square).attr('data-type')][$(square).attr('data-state')].bg, 'border-color': window.data.types['t' + $(square).attr('data-type')][$(square).attr('data-state')].br}, 300, function (e) {
                            app.checkForFinish();
                        });
                    } else {
                        $(square).find('.inner').css({'background-color': window.data.types['t' + $(square).attr('data-type')][$(square).attr('data-state')].bg, 'border-color': window.data.types['t' + $(square).attr('data-type')][$(square).attr('data-state')].br});
                    }
                });
                break;
            }
        }
        
    },
    
    controls: {
        
        getNeighbours: function (handler) {
            'use strict';
            var neighbours = [];
            switch ($(handler).attr('data-action')) {
            case '1':
                if ($(handler).hasClass('t') || $(handler).hasClass('b')) {
                    neighbours.push($('.content .field .square.c' + $(handler).attr('data-column')));
                }
                if ($(handler).hasClass('l') || $(handler).hasClass('r')) {
                    neighbours.push($('.content .field .square.r' + $(handler).attr('data-row')));
                }
                break;
            case '2':
                if ($(handler).hasClass('t') || $(handler).hasClass('b')) {
                    neighbours.push($('.content .field .square.c' + $(handler).attr('data-column')));
                    neighbours.push($('.content .field .square.c' + (parseInt($(handler).attr('data-column'), 10) + 1)));
                }
                if ($(handler).hasClass('l') || $(handler).hasClass('r')) {
                    neighbours.push($('.content .field .square.r' + $(handler).attr('data-row')));
                    neighbours.push($('.content .field .square.r' + (parseInt($(handler).attr('data-row'), 10) + 1)));
                }
                break;
            }
            return neighbours;
        },
        
        switchNeighbours: function (handler, withAnimation) {
            'use strict';
            switch ($(handler).attr('data-action')) {
            case '1':
                switch ($(handler).attr('data-position')) {
                case 't':
                    $('.content .field .square.c' + $(handler).attr('data-column')).each(function (index, square) {
                        //window.alert($(square).attr('data-row'));
                        $(square).removeClass('r' + $(square).attr('data-row'));
                        if (parseInt($(square).attr('data-row'), 10) > 1) {
                            $(square).animate({'top': ('-=' + (app.state.square.body + 2 * app.state.square.borderTotal) +  'px')}, 300);
                        } else {
                            $(square).animate({'top': ('+=' + ((app.level.field.height - 1) * (app.state.square.body + 2 * app.state.square.borderTotal)) +  'px')}, 300);
                        }
                        $(square).attr('data-row', parseInt($(square).attr('data-row'), 10) > 1 ? parseInt($(square).attr('data-row'), 10) - 1 : app.level.field.height);
                        $(square).addClass('r' + $(square).attr('data-row'));
                    });
                    break;
                        
                case 'b':
                    $('.content .field .square.c' + $(handler).attr('data-column')).each(function (index, square) {
                        $(square).removeClass('r' + $(square).attr('data-row'));
                        if (parseInt($(square).attr('data-row'), 10) < app.level.field.height) {
                            $(square).animate({'top': ('+=' + (app.state.square.body + 2 * app.state.square.borderTotal) +  'px')}, 300);
                        } else {
                            $(square).animate({'top': ('-=' + ((app.level.field.height - 1) * (app.state.square.body + 2 * app.state.square.borderTotal)) +  'px')}, 300);
                        }
                        $(square).attr('data-row', parseInt($(square).attr('data-row'), 10) < app.level.field.height ? parseInt($(square).attr('data-row'), 10) + 1 : 1);
                        $(square).addClass('r' + $(square).attr('data-row'));
                    });
                    break;
                        
                case 'l':
                    $('.content .field .square.r' + $(handler).attr('data-row')).each(function (index, square) {
                        //window.alert($(square).attr('data-row'));
                        $(square).removeClass('c' + $(square).attr('data-column'));
                        if (parseInt($(square).attr('data-column'), 10) > 1) {
                            $(square).animate({'left': ('-=' + (app.state.square.body + 2 * app.state.square.borderTotal) +  'px')}, 300);
                        } else {
                            $(square).animate({'left': ('+=' + ((app.level.field.width - 1) * (app.state.square.body + 2 * app.state.square.borderTotal)) +  'px')}, 300);
                        }
                        $(square).attr('data-column', parseInt($(square).attr('data-column'), 10) > 1 ? parseInt($(square).attr('data-column'), 10) - 1 : app.level.field.width);
                        $(square).addClass('c' + $(square).attr('data-column'));
                    });
                    break;
                        
                case 'r':
                    $('.content .field .square.r' + $(handler).attr('data-row')).each(function (index, square) {
                        $(square).removeClass('c' + $(square).attr('data-column'));
                        if (parseInt($(square).attr('data-column'), 10) < app.level.field.width) {
                            $(square).animate({'left': ('+=' + (app.state.square.body + 2 * app.state.square.borderTotal) +  'px')}, 300);
                        } else {
                            $(square).animate({'left': ('-=' + ((app.level.field.width - 1) * (app.state.square.body + 2 * app.state.square.borderTotal)) +  'px')}, 300);
                        }
                        $(square).attr('data-column', parseInt($(square).attr('data-column'), 10) < app.level.field.width ? parseInt($(square).attr('data-column'), 10) + 1 : 1);
                        $(square).addClass('c' + $(square).attr('data-column'));
                    });
                    break;
                }
                break;
                    
            case '2':
                switch ($(handler).attr('data-position')) {
                case 't':
                case 'b':
                    $('.content .field .square.c' + $(handler).attr('data-column')).each(function (index, square) {
                        $(square).removeClass('c' + $(square).attr('data-column'));
                        $(square).attr('data-column', parseInt($(square).attr('data-column'), 10) + 1);
                        $(square).animate({'left': '+=' + app.state.square.total + 'px'}, 300, function () {
                            $(square).addClass('c' + $(square).attr('data-column'));
                        });
                        
                    });
                    $('.content .field .square.c' + (parseInt($(handler).attr('data-column'), 10) + 1)).each(function (index, square) {
                        $(square).removeClass('c' + $(square).attr('data-column'));
                        $(square).attr('data-column', parseInt($(square).attr('data-column'), 10) - 1);
                        $(square).animate({'left': '-=' + app.state.square.total + 'px'}, 300);
                        $(square).addClass('c' + $(square).attr('data-column'));
                    });
                    break;
                    
                case 'l':
                case 'r':
                    $('.content .field .square.r' + $(handler).attr('data-row')).each(function (index, square) {
                        $(square).removeClass('r' + $(square).attr('data-row'));
                        $(square).attr('data-row', parseInt($(square).attr('data-row'), 10) + 1);
                        $(square).animate({'top': '+=' + app.state.square.total + 'px'}, 300, function () {
                            $(square).addClass('r' + $(square).attr('data-row'));
                        });
                        
                    });
                    $('.content .field .square.r' + (parseInt($(handler).attr('data-row'), 10) + 1)).each(function (index, square) {
                        $(square).removeClass('r' + $(square).attr('data-row'));
                        $(square).attr('data-row', parseInt($(square).attr('data-row'), 10) - 1);
                        $(square).animate({'top': '-=' + app.state.square.total + 'px'}, 300);
                        $(square).addClass('r' + $(square).attr('data-row'));
                    });
                    break;
                }
                break;
            }
        }
        
    },
    
    checkForFinish: function () {
        'use strict';
        var s = 0,
            i,
            j;
        for (i = 1; i <= app.level.field.height; i += 1) {
            for (j = 1; j <= app.level.field.width; j += 1) {
                s += parseInt($('.content .field .square.c' + j + '.r' + i).attr('data-state'), 10);
            }
        }
        if (s === 0 && app.state.active) {
            window.alert("Congratulations!");
            app.state.active = false;
        }
    },
    
    rebuildInterface: function () {
        'use strict';
        $('.header, .content').height($(window).height() - parseInt($('.header').css('padding-top'), 10) * 2);
        app.state.width = $('.content').width();
        app.state.height = $(window).height() - $('.content .field').position().top - parseInt($('.content').css('padding-bottom'), 10) - parseInt($('.content .field').css('margin-top'), 10) - parseInt($('.content .field').css('margin-bottom'), 10);
        $('.content .field').height(app.state.height);
        var squareCountV = app.level.field.height + (app.level.field.controls.t.length > 0 ? 1 : 0) + (app.level.field.controls.b.length > 0 ? 1 : 0),
            squareCountH = app.level.field.width  + (app.level.field.controls.l.length > 0 ? 1 : 0) + (app.level.field.controls.r.length > 0 ? 1 : 0),
            squareSizeV = Math.floor(app.state.height / squareCountV),
            squareSizeH = Math.floor(app.state.width / squareCountH),
            offsetV = app.level.field.controls.t.length > 0 ? 1 : 0,
            offsetH = app.level.field.controls.l.length > 0 ? 1 : 0;
        app.state.square.total = Math.min(squareSizeH, squareSizeV);
        app.state.square.borderTotal = Math.floor(app.state.square.total * app.consts.square.borderPercentage);
        app.state.square.body = app.state.square.total - app.state.square.borderTotal * 2;
        app.state.square.border = Math.min(3, app.state.square.borderTotal);
        app.state.square.margin = app.state.square.borderTotal - app.state.square.border;
        $('.content .field .square').css('height', app.state.square.body + 'px').css('width', app.state.square.body + 'px')
                                    .css('border-width', app.state.square.border + 'px')
                                    .css('margin', app.state.square.margin + 'px');
        $('.content .field .square .inner').css('height', (app.state.square.body - 2) + 'px').css('width', (app.state.square.body - 2) + 'px');
        $('.content .field .square').each(function (index, value) {
            $(value).css('top', ((parseInt($(value).attr('data-row'), 10) + offsetV - 1) * app.state.square.total) + 'px');
            $(value).css('left', ((parseInt($(value).attr('data-column'), 10) + offsetH - 1) * app.state.square.total) + 'px');
            $(value).find('.inner').css('background-color', window.data.types['t' + $(value).attr('data-type')][$(value).attr('data-state')].bg);
            $(value).find('.inner').css('border-color', window.data.types['t' + $(value).attr('data-type')][$(value).attr('data-state')].br);
        });
        $('.content .field .control').css('height', app.state.square.body + 'px').css('width', app.state.square.body + 'px')
                                     .css('border-width', app.state.square.border + 'px')
                                     .css('margin', app.state.square.margin + 'px');
        $('.content .field .control .inner').css('height', (app.state.square.body - 2) + 'px').css('width', (app.state.square.body - 2) + 'px');
        $('.content .field .control.t.a2, .content .field .control.b.a2').css('width', (2 * (app.state.square.body + app.state.square.borderTotal)) + 'px');
        $('.content .field .control.l.a2, .content .field .control.r.a2').css('height', (2 * (app.state.square.body + app.state.square.borderTotal)) + 'px');
        $('.content .field .control.t.a2 .inner, .content .field .control.b.a2 .inner').css('width', (2 * (app.state.square.body + app.state.square.borderTotal) - 2) + 'px');
        $('.content .field .control.l.a2 .inner, .content .field .control.r.a2 .inner').css('height', (2 * (app.state.square.body + app.state.square.borderTotal) - 2) + 'px');
        $('.content .field .control.t').each(function (index, value) {
            $(value).css('top', '0px');
            $(value).css('left', ((parseInt($(value).attr('data-column'), 10) + offsetH - 1) * app.state.square.total) + 'px');
        });
        $('.content .field .control.l').each(function (index, value) {
            $(value).css('top', ((parseInt($(value).attr('data-row'), 10) + offsetV - 1) * app.state.square.total) + 'px');
            $(value).css('left', '0px');
        });
        $('.content .field .control.b').each(function (index, value) {
            $(value).css('top', ((app.level.field.height + offsetV) * app.state.square.total) + 'px');
            $(value).css('left', ((parseInt($(value).attr('data-column'), 10) + offsetH - 1) * app.state.square.total) + 'px');
        });
        $('.content .field .control.r').each(function (index, value) {
            $(value).css('top', ((parseInt($(value).attr('data-row'), 10) + offsetV - 1) * app.state.square.total) + 'px');
            $(value).css('left', ((app.level.field.width + offsetH) * app.state.square.total) + 'px');
        });
    },
    
    init: function () {
        'use strict';
        $(document).attr('unselectable', 'on')
                   .css('user-select', 'none')
                   .on('selectstart', false);
        $('.header, .content').height($(window).height() - parseInt($('.header').css('padding-top'), 10) * 2);
        $('.content').on('click', '.intro .btn.main', function () {
            app.level.start();
        });
        $(window).resize(function () {
            app.rebuildInterface();
        });
        
        $('.content').on('mouseover', '.field .square', function () {
            switch ($(this).attr('data-action')) {
            case '0':
                $(this).addClass('stone');
                break;
            default:
                //window.alert(app.squares.getNeighbours($(this)).length);
                $(this).addClass('live');
                $.each(app.squares.getNeighbours($(this)), function (index, handler) {
                    //window.alert($(handler).attr('class'));
                    $(handler).addClass('neighbour');
                });
            }
        }).on('mouseout', '.field .square', function () {
            $(this).removeClass('live').removeClass('stone');
            $('.content .field .square').removeClass('neighbour');
        }).on('click', '.field .square', function (e, withAnimation) {
            app.squares.switchNeighbours($(this), withAnimation === undefined ? true : false);
        });
        
        $('.content').on('mouseover', '.field .control', function () {
            $(this).addClass('live');
            $.each(app.controls.getNeighbours($(this)), function (index, handler) {
                $(handler).addClass('neighbour');
            });
        }).on('mouseout', '.field .control', function () {
            $(this).removeClass('live');
            $('.content .field .square').removeClass('neighbour');
        }).on('click', '.field .control', function (e, withAnimation) {
            app.controls.switchNeighbours($(this), withAnimation === undefined ? true : false);
        });
        
        
        $('.trackbar .handler').on('mousedown', function (e) {
            app.state.dragDropObject = $(this);
            app.state.dragDropStart = e.pageX;
            //console.log('Down: ' + app.state.dragDropStart);
            //alert(app.state.dragDropStart);
        });
        $(document).on('mousemove', function (e) {
            if (undefined === app.state.dragDropObject) {
                return;
            }
            var left = (e.pageX - 27),
                text = '';
            left = Math.min(231, left);
            left = Math.max(5, left);
            $(app.state.dragDropObject).css({
                left: left + 'px'
            }).attr('data-position', left - 5);
            switch ($(app.state.dragDropObject).attr('id')) {
            case 'game-field-size':
                text = Math.floor((left - 5) / 226 * 7 + 5).toString() + ' x ' + Math.floor((left - 5) / 226 * 5 + 4).toString();
                break;
            case 'game-difficulty':
                text = Math.floor((left - 5) / 226 * 40).toString();
                break;
            }
            $(app.state.dragDropObject).closest('.trackbar').find('.value').text(text);
        }).on('mouseup', function () {
            app.state.dragDropObject = undefined;
        });
    }
    
};

window.data = {
    types: {
        t0: [{'bg': '#fff', 'br': '#ccc'},
             {'bg': '#aaa', 'br': '#aaa'},
             {'bg': '#444', 'br': '#444'}],
        t1: [{'bg': '#fff', 'br': '#ccc'},
             {'bg': '#444', 'br': '#444'}]
    }
};