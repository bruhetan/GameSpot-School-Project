import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';



const GameDetails = () => {
  let { gameId } = useParams();
    const [gameDetails, setGameDetails] = useState(null);
    const [similarGames, setSimilarGames] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem('token');  // Retrieve the stored token here for broader use

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const detailsResponse = await axios.get(`http://localhost:3000/game/${gameId}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          }
        });


        console.log(detailsResponse.data)

        const commentsResponse = await axios.get(`http://localhost:3000/game/${gameId}/comment`);

        setGameDetails(detailsResponse.data[0]);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');  // Retrieve the stored token

    if (!token) {  // Check if the token is present
        alert("You need to be logged in to add comments");
        return;  // Stop execution if not logged in
    }

    if (newComment.trim()) {
        const headers = {
            Authorization: `Bearer ${token}`  // Prepare authorization header
        };

        try {
            const response = await axios.post(
                `http://localhost:3000/game/${gameId}/comment`,
                { comment: newComment },
                { headers: headers }
            );
            setComments([...comments, response.data]);
            setNewComment(''); // Clear the input after successful submission
        } catch (error) {
            console.error('Error posting comment:', error);
            alert("Failed to post comment");
        }
    }
};

    if (isLoading) return <p>Loading game details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Game Details</h1>
            {gameDetails && (
                <div>
                    <h2>{gameDetails.name}</h2>
                    {gameDetails.cover &&
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_1080p/${gameDetails.cover.url.split('/').pop()}`}
                        alt={`Cover for ${gameDetails.name}`}
                        style={{ height: '300px' }}
                      />
                    }
                    <p><strong>Release Date:</strong> {new Date(gameDetails.first_release_date).toLocaleDateString()}</p>
                    {gameDetails.total_rating && <p><strong>Rating:</strong> {gameDetails.total_rating.toFixed(2)}</p>}
                    <h3>Similar Games</h3>
                    <ul>
                        {gameDetails.similar_games && gameDetails.similar_games.length > 0 &&
                          gameDetails.similar_games.map(game => <li key={game.id}>{game.name}</li>)}
                    </ul>
                    <h3>Comments</h3>
                    <ul>
                        {comments.map(comment => <li key={comment._id}>{comment.comment}</li>)}
                    </ul>
                    {token ? (
                        <form onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your comment here..."
                            />
                            <button type="submit">Post Comment</button>
                        </form>
                    ) : (
                        <p>You need to <a href="/login">login</a> to add comments.</p>  // Update this link as per your routing
                    )}
                </div>
            )}
        </div>
    );
};

export default GameDetails;