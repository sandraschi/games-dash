import React from 'react';

interface ChessBoardProps {
    fen?: string;
    onMove?: (move: string) => void;
    lastMove?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" }) => {
    // Simple FEN parser to board array (8x8)
    const parseFen = (fenString: string) => {
        const [position] = fenString.split(' ');
        const rows = position.split('/');
        const board: (string | null)[] = [];

        rows.forEach(row => {
            for (const char of row) {
                if (!isNaN(parseInt(char))) {
                    board.push(...Array(parseInt(char)).fill(null));
                } else {
                    board.push(char);
                }
            }
        });
        return board;
    };

    const board = parseFen(fen);

    const getPieceSymbol = (piece: string) => {
        const symbols: Record<string, string> = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        return symbols[piece] || '';
    };

    return (
        <div className="chess-board-wrapper glass-panel">
            <div className="chess-board">
                {board.map((piece, i) => (
                    <div
                        key={i}
                        className={`square ${((Math.floor(i / 8) + (i % 8)) % 2 === 0) ? 'light' : 'dark'}`}
                    >
                        {piece && (
                            <span className={`piece ${piece === piece.toUpperCase() ? 'white-piece' : 'black-piece'}`}>
                                {getPieceSymbol(piece)}
                            </span>
                        )}
                        {/* Coordinates for edge squares */}
                        {i % 8 === 0 && <span className="coord rank">{8 - Math.floor(i / 8)}</span>}
                        {i >= 56 && <span className="coord file">{String.fromCharCode(97 + (i % 8))}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChessBoard;
