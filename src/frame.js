
  export function mouldingHeight(frame) {
    let length = Number(frame.artHeight) + 2 * frame.profile
    if (frame.hasMat) {
      length += (frame.matTop + frame.matBottom)
    }
    return length
  }

  export function mouldingWidth(frame) {
    let length = Number(frame.artWidth) + 2 * frame.profile
    if (frame.hasMat) {
      length += (2 * frame.matSides)
    }
    return length
  }

  export function getMoulding(frame) {
    return {
      width: mouldingWidth(frame),
      height: mouldingHeight(frame),
      profile: frame.profile,
      overlap: frame.overlap,
    }
  }

  function matOuter(frame) {
    let width = frame.artWidth
    let height = frame.artHeight
    if (frame.hasMat) {
      width += 2 * frame.matSides
      height += frame.matTop + frame.matBottom
    }
    return {
      width,
      height
    }
  }

  function matInner(frame) {
    return {
      width: frame.artWidth,
      height: frame.artHeight
    }
  }

