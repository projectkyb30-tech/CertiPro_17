import { describe, it, expect } from 'vitest';
import { getEmptyCoursesHeroMotionProps } from './EmptyCoursesHero';

describe('getEmptyCoursesHeroMotionProps', () => {
  it('dezactivează animațiile când utilizatorul preferă reduced-motion', () => {
    const props = getEmptyCoursesHeroMotionProps(true);
    expect(props).toEqual({});
  });

  it('activează animația fade-in + slide-up când animațiile sunt permise', () => {
    const props = getEmptyCoursesHeroMotionProps(false);

    expect(props.initial).toEqual({ opacity: 0, y: 16 });
    expect(props.animate).toEqual({ opacity: 1, y: 0 });
    expect(props.transition).toMatchObject({
      duration: 0.6,
      ease: 'easeOut',
      delay: 0.2,
    });
  });
});
