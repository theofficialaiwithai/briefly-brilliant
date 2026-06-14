export type YouTubeInfo = {
  videoId: string | null;
  playlistId: string | null;
  isPlaylist: boolean;
  isChannel: boolean;
};

export function getYouTubeInfo(url: string): YouTubeInfo {
  try {
    const u = new URL(url);
    const isYT = u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
    if (!isYT) return { videoId: null, playlistId: null, isPlaylist: false, isChannel: false };
    const playlistId = u.searchParams.get("list");
    const videoId = u.hostname.includes("youtu.be")
      ? u.pathname.slice(1)
      : u.searchParams.get("v");
    if (playlistId) return { videoId, playlistId, isPlaylist: true, isChannel: false };
    if (videoId) return { videoId, playlistId: null, isPlaylist: false, isChannel: false };
    const p = u.pathname;
    const isChannel =
      p.startsWith("/@") || p.includes("/channel/") || p.includes("/c/") || p.includes("/user/");
    return { videoId: null, playlistId: null, isPlaylist: false, isChannel };
  } catch {
    return { videoId: null, playlistId: null, isPlaylist: false, isChannel: false };
  }
}

export async function fetchChannelUploads(
  channelUrl: string
): Promise<{ playlistId: string; videos: any[] } | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  try {
    const u = new URL(channelUrl);
    const pathname = u.pathname;

    let channelParam = "";
    if (pathname.startsWith("/@")) {
      channelParam = `forHandle=${encodeURIComponent(pathname.slice(2))}`;
    } else if (pathname.includes("/channel/")) {
      channelParam = `id=${pathname.split("/channel/")[1].split("/")[0]}`;
    } else if (pathname.includes("/c/")) {
      channelParam = `forUsername=${pathname.split("/c/")[1].split("/")[0]}`;
    } else if (pathname.includes("/user/")) {
      channelParam = `forUsername=${pathname.split("/user/")[1].split("/")[0]}`;
    }
    if (!channelParam) return null;

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&${channelParam}&key=${apiKey}`
    );
    const channelJson = await channelRes.json();
    const uploadsPlaylistId = channelJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return null;

    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
    );
    const videosJson = await videosRes.json();
    const videos =
      (videosJson.items ?? []).map((item: any, index: number) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.default?.url,
        position: index,
      }));

    return { playlistId: uploadsPlaylistId, videos };
  } catch {
    return null;
  }
}
