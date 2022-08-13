module.exports = (arr, auth) =>{
    const access = arr
    arr.forEach((course, courseIndex) => {
        course.sections.forEach((section, sectionIndex) => {
            section.videos.forEach((video, videoIndex) => {
                // 1 / Check if the video is public or not
                // 2 / Check if the authenticated user is participated
                // 3 / Check if the authenticated user is the owner of this course
                if (!video.public && (course.participants.filter(participant=> participant.user.toString() === auth).length === 0) && course.user.toString() !== auth){
                    access[courseIndex].sections[sectionIndex].videos[videoIndex].directory = "/unauthorized.mp4"
                }
            })
        })
    })
    return access
}