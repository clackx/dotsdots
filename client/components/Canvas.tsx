import { observer } from "mobx-react-lite";
import { useContext, useEffect, useRef, useState } from 'react';
import { TFieldObj, TMoveObj, TPath_, TPair_ } from '../types';
import styles from '../styles/Canvas.module.css';
import { SocketContext } from './SocketProvider';

const Canvas = observer(() => {

    const { socket } = useContext(SocketContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    type TContext = CanvasRenderingContext2D;

    const columnsCount = 26;
    const rowsCount = 20;
    const paddingLeft = 40;
    const paddingTop = 40;
    const cellSize = 30;
    const linewidth = 4;
    const radius = 10 - Math.round(linewidth / 2);

    var innerColors = ['', 'green', 'blue', '#004400', '#000099', 'green', 'blue', '#8EFFD6', '#8ED6FF', 'yellow', 'pink']
    var outerColors = ['', '#004400', '#000099', 'green', 'blue', '#8EFFD6', '#8ED6FF', 'green', 'blue', 'cyan', 'red']

    const colors = ["#FFFFCC", "#FFFF99", "#FFFF66", "#FFFF33", "#FFFF00", "#CCCC00", "#FFCC66", "#FFCC00",
        "#FFCC33", "#CC9900", "#CC9933", "#996600", "#FF9900", "#FF9933", "#CC9966", "#CC6600", "#996633",
        "#663300", "#FFCC99", "#FF9966", "#FF6600", "#CC6633", "#993300", "#660000", "#FF6633", "#CC3300",
        "#FF3300", "#FF0000", "#CC0000", "#990000", "#FFCCCC", "#FF9999", "#FF6666", "#FF3333", "#FF0033",
        "#CC0033", "#CC9999", "#CC6666", "#CC3333", "#993333", "#990033", "#330000", "#FF6699", "#FF3366",
        "#FF0066", "#CC3366", "#996666", "#663333", "#FF99CC", "#FF3399", "#FF0099", "#CC0066", "#993366",
        "#660033", "#FF66CC", "#FF00CC", "#FF33CC", "#CC6699", "#CC0099", "#990066", "#FFCCFF", "#FF99FF",
        "#FF66FF", "#FF33FF", "#FF00FF", "#CC3399", "#CC99CC", "#CC66CC", "#CC00CC", "#CC33CC", "#990099",
        "#993399", "#CC66FF", "#CC33FF", "#CC00FF", "#9900CC", "#996699", "#660066", "#CC99FF", "#9933CC",
        "#9933FF", "#9900FF", "#660099", "#663366", "#9966CC", "#9966FF", "#6600CC", "#6633CC", "#663399",
        "#330033", "#CCCCFF", "#9999FF", "#6633FF", "#6600FF", "#330099", "#330066", "#9999CC", "#6666FF",
        "#6666CC", "#666699", "#333399", "#333366", "#3333FF", "#3300FF", "#3300CC", "#3333CC", "#000099",
        "#000066", "#6699FF", "#3366FF", "#0000FF", "#0000CC", "#0033CC", "#000033", "#0066FF", "#0066CC",
        "#3366CC", "#0033FF", "#003399", "#003366", "#99CCFF", "#3399FF", "#0099FF", "#6699CC", "#336699",
        "#006699", "#66CCFF", "#33CCFF", "#00CCFF", "#3399CC", "#0099CC", "#003333", "#99CCCC", "#66CCCC",
        "#339999", "#669999", "#006666", "#336666", "#CCFFFF", "#99FFFF", "#66FFFF", "#33FFFF", "#00FFFF",
        "#00CCCC", "#99FFCC", "#66FFCC", "#33FFCC", "#00FFCC", "#33CCCC", "#009999", "#66CC99", "#33CC99",
        "#00CC99", "#339966", "#009966", "#006633", "#66FF99", "#33FF99", "#00FF99", "#33CC66", "#00CC66",
        "#009933", "#99FF99", "#66FF66", "#33FF66", "#00FF66", "#339933", "#006600", "#CCFFCC", "#99CC99",
        "#66CC66", "#669966", "#336633", "#003300", "#33FF33", "#00FF33", "#00FF00", "#00CC00", "#33CC33",
        "#00CC33", "#66FF00", "#66FF33", "#33FF00", "#33CC00", "#339900", "#009900", "#CCFF99", "#99FF66",
        "#66CC00", "#66CC33", "#669933", "#336600", "#99FF00", "#99FF33", "#99CC66", "#99CC00", "#99CC33",
        "#669900", "#CCFF66", "#CCFF00", "#CCFF33", "#CCCC99", "#666633", "#333300", "#CCCC66", "#CCCC33",
        "#999966", "#999933", "#999900", "#666600", "#FFFFFF", "#CCCCCC", "#999999", "#666666", "#333333"]


    function drawLine(context: TContext, [x0, y0]: TPair_, [x1, y1]: TPair_) {
        context.beginPath();
        context.moveTo(paddingLeft + x0, paddingTop + y0);
        context.lineTo(paddingLeft + x1, paddingTop + y1);
        context.lineWidth = 0.1;
        context.strokeStyle = '#0c00b6';
        context.stroke();
    }


    function drawGrid(context: TContext) {
        context.font = "18px serif";
        context.fillStyle = "green";
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const rowlen = columnsCount * cellSize - cellSize;
        const columnlen = rowsCount * cellSize - cellSize;

        for (let i = 0; i < columnsCount; i++) {
            var x = cellSize * i;
            drawLine(context, [x, 0], [x, columnlen])
            context.fillText(alphabet[i], paddingLeft - 5 + x, 20);
        }

        for (let i = 0; i < rowsCount; i++) {
            var y = cellSize * i;
            drawLine(context, [0, y], [rowlen, y])
            context.fillText((i + 1).toString(), 10, paddingTop + 5 + y);
        }
    }


    function drawPath(context: TContext, path: TPath_,
        lineWidth: number, lineColor: string, fillColor = '#000') {

        context.beginPath();
        context.moveTo(
            path[0][0] * cellSize + paddingLeft,
            path[0][1] * cellSize + paddingTop);
        path.forEach((pair: TPair_) => {
            context.lineTo(
                pair[0] * cellSize + paddingLeft,
                pair[1] * cellSize + paddingTop)
        });
        context.closePath();
        context.lineWidth = lineWidth;

        if (fillColor !== '#000') {
            fillColor == '#abc' &&   // get random color
                (fillColor = colors[Math.floor(Math.random() * colors.length)])
            context.fillStyle = fillColor;
            context.fill();
        }

        context.strokeStyle = lineColor;
        context.stroke();
    }


    function drawDot(context: TContext,
        [x, y]: TPair_, fillStyle: string, strokeStyle: string) {
        context.beginPath();
        context.arc(
            x * cellSize + paddingLeft,
            y * cellSize + paddingTop,
            radius, 0, 2 * Math.PI);
        context.fillStyle = fillStyle;
        context.fill();
        context.lineWidth = linewidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }


    function makeMove(context: TContext, moves: TMoveObj) {
        const { move, number } = moves.currMove;
        const [x, y] = move;

        // redraw prev dot with regular color
        if (moves.prevMove) {
            const [prevx, prevy] = moves.prevMove.move
            drawDot(context, [prevx, prevy],
                innerColors[number], outerColors[number])
        }

        drawDot(context, [x, y],
            number == 1 ? '#8EFFD6' : '#8ED6FF',
            number == 1 ? '#004400' : '#000099')
    }


    function redrawField(context: TContext, field: TFieldObj) {

        var areas = field?.areas || [];
        areas.forEach(element => {
            var path = element.path;
            if (path.length) {
                // thick border
                var number = element.number;
                var color = number == 1 ? '#6EAF26' : '#6E66FF'
                drawPath(context, path, 12, color)

                // thinner
                color = number == 1 ? '#8EFFD6' : '#8ED6FF'
                drawPath(context, path, 7, color)

                // thin border and filling
                var lc = number == 1 ? '#004400' : '#000099'
                var fc = number == 1 ? '#8EFFD6' : '#8ED6FF'
                drawPath(context, path, 5, lc, '#abc')
            }
        });


        var paths = field?.paths || [];
        paths.forEach(element => {
            var path = element.path;
            if (path.length) {
                var number = element.number;
                var lc = number == 1 ? '#004400' : '#000099'
                var fc = number == 1 ? '#8EFFD6' : '#8ED6FF'
                drawPath(context, path, 5, lc, '#abc')
            }
        });


        var matrix = field?.matrix;
        if (matrix) {
            matrix.map((row: number[], i: number) =>
                row.map((dotType, j) => {
                    if (dotType > 0) {
                        drawDot(context, [i, j],
                            innerColors[dotType],
                            outerColors[dotType]);
                    }
                }));
        }

        var lastMove = field?.moves[field?.moves.length - 1]
        if (lastMove) {
            drawDot(context, lastMove.move,
                lastMove.number == 1 ? 'yellow' : 'yellow',
                lastMove.number == 1 ? '#004400' : '#000099')
        }
    }


    useEffect(() => {
        const context: TContext = canvasRef.current?.getContext('2d') as TContext;
        drawGrid(context);

        if (socket) {
            socket.on('dotToClient', (data: TMoveObj) => {
                makeMove(context, data)
            })

            socket.on('fieldToClient', (field: TFieldObj) => {
                redrawField(context, field)
            })

            socket.emit('msgToServer', { event: "getField" })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket])


    const clickEffect = (e: React.MouseEvent<HTMLElement>) => {
        var x = Math.round((e.pageX - (e.target as HTMLElement).offsetLeft - paddingLeft) / cellSize)
        var y = Math.round((e.pageY - (e.target as HTMLElement).offsetTop - paddingTop) / cellSize)
        console.log('X, Y', x, y);

        if (socket) {
            socket.emit('msgToServer', { event: "click", array: [x, y] });
        }
    };

    return (<><div className={styles.mainDiv} onClick={clickEffect}>
        <canvas ref={canvasRef}
            width={columnsCount * cellSize + paddingLeft}
            height={rowsCount * cellSize + paddingTop} /></div>
        <p className={styles.copyleft}>🄯 2023 timeclackx</p></>)

})

export default Canvas;